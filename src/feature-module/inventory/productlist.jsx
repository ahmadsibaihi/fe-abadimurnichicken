import {
  Box,
  ChevronUp,
  Edit,
  Eye,
  Filter,
  GitMerge,
  PlusCircle,
  RotateCcw,
  Sliders,
  StopCircle,
  Trash2,
} from "feather-icons-react/build/IconComponents";
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import Brand from "../../core/modals/inventory/brand";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { all_routes } from "../../Router/all_routes";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Table from "../../core/pagination/datatable";
import { setToogleHeader } from "../../core/redux/action";
import { Download } from "react-feather";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import API from "../../api/api";

const ProductList = () => {
  const [products, setProducts] = useState([]);       // data asli dari API
  const [filteredProducts, setFilteredProducts] = useState([]); // data setelah filter
  const [loading, setLoading] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const route = all_routes;

  // State untuk filter & search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [sortOption, setSortOption] = useState(null); // newest/oldest

  // Fungsi ambil data dari backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/products");
      const mappedData = res.data.map((p) => ({
        id: p.id,
        product: p.name,
        productImage: `http://127.0.0.1:3000/uploads/${p.image}`,
        sku: p.sku || `PRD-${p.id}`,
        stock: p.stock,
        cooking_time: p.cooking_time,
        description: p.description,
        is_best_seller: p.is_best_seller,
        is_new: p.is_new,
        is_active: p.is_active,
        createdby: "Admin",
        category: p.category || null,
        sub_category: p.sub_category || null,
        brand: p.brand || null,
        price: p.price || 0,
      }));
      setProducts(mappedData);
    } catch (err) {
      console.error("Gagal load produk:", err);
      Swal.fire("Error", "Gagal memuat data produk", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Auto-refresh setiap 30 detik (realtime sederhana)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchProducts]);

  // Fungsi filter & sorting
  const applyFilters = useCallback(() => {
    let result = [...products];

    // Filter by search term (nama produk)
    if (searchTerm) {
      result = result.filter((p) =>
        p.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory.value !== "all") {
      result = result.filter((p) => p.category === selectedCategory.value);
    }

    // Filter by sub category
    if (selectedSubCategory && selectedSubCategory.value !== "all") {
      result = result.filter((p) => p.sub_category === selectedSubCategory.value);
    }

    // Filter by brand
    if (selectedBrand && selectedBrand.value !== "all") {
      result = result.filter((p) => p.brand === selectedBrand.value);
    }

    // Filter by price ascending/descending
    if (selectedPrice) {
      if (selectedPrice.value === "asc") {
        result.sort((a, b) => a.price - b.price);
      } else if (selectedPrice.value === "desc") {
        result.sort((a, b) => b.price - a.price);
      }
    }

    // Sort by date (newest/oldest) - asumsikan ada field created_at
    if (sortOption) {
      if (sortOption.value === "newest") {
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (sortOption.value === "oldest") {
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      }
    }

    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, selectedSubCategory, selectedBrand, selectedPrice, sortOption]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Reset semua filter
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedBrand(null);
    setSelectedPrice(null);
    setSortOption(null);
    setIsFilterVisible(false);
  };

  // Handler untuk tombol Search di panel filter
  const handleSearchClick = () => {
    applyFilters();
  };

  // Export ke Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredProducts.map((p) => ({
        "Nama Produk": p.product,
        SKU: p.sku,
        Stok: p.stock,
        "Waktu Masak": p.cooking_time,
        Deskripsi: p.description,
        "Best Seller": p.is_best_seller ? "Ya" : "Tidak",
        Baru: p.is_new ? "Ya" : "Tidak",
        Status: p.is_active ? "Aktif" : "Non-Aktif",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, `products_${new Date().toISOString().slice(0, 19)}.xlsx`);
  };

  // Export ke PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Daftar Produk", 14, 10);
    const tableData = filteredProducts.map((p) => [
      p.product,
      p.sku,
      p.stock.toString(),
      p.cooking_time ? `${p.cooking_time} menit` : "-",
      p.is_active ? "Aktif" : "Non-Aktif",
    ]);
    doc.autoTable({
      head: [["Nama Produk", "SKU", "Stok", "Waktu Masak", "Status"]],
      body: tableData,
      startY: 20,
    });
    doc.save(`products_${new Date().toISOString().slice(0, 19)}.pdf`);
  };

  // Print (cetak tabel)
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const tableContent = document.querySelector(".table-responsive").cloneNode(true);
    printWindow.document.write(`
      <html>
        <head><title>Daftar Produk</title>
        <link rel="stylesheet" href="${window.location.origin}/assets/css/bootstrap.min.css">
        </head>
        <body>${tableContent.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  // Refresh manual
  const handleRefresh = () => {
    fetchProducts();
  };

  // Konfigurasi dropdown (contoh, sesuaikan dengan data asli dari backend)
  const productlist = [
    { value: "all", label: "All Products" },
    { value: "product1", label: "Product 1" },
  ];
  const categorylist = [
    { value: "all", label: "All Categories" },
    { value: "makanan", label: "Makanan" },
    { value: "minuman", label: "Minuman" },
  ];
  const subcategorylist = [
    { value: "all", label: "All Sub Categories" },
  ];
  const brandlist = [
    { value: "all", label: "All Brands" },
    { value: "nike", label: "Nike" },
  ];
  const priceOptions = [
    { value: "asc", label: "Price Ascending" },
    { value: "desc", label: "Price Descending" },
  ];
  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ];

  // Tooltips (sama seperti sebelumnya)
  const renderTooltip = (props, text) => <Tooltip {...props}>{text}</Tooltip>;

  // Columns (sama, tapi aksi hapus perlu id)
  const columns = [
    {
      title: "Product",
      dataIndex: "product",
      render: (text, record) => (
        <span className="productimgname">
          <Link to="/profile" className="product-img stock-img">
            <ImageWithBasePath alt="" src={record.productImage} />
          </Link>
          <Link to="/profile">{text}</Link>
        </span>
      ),
    },
    { title: "SKU", dataIndex: "sku" },
    { title: "Stok", dataIndex: "stock", sorter: (a, b) => a.stock - b.stock },
    {
      title: "Waktu Masak",
      dataIndex: "cooking_time",
      render: (text) => `${text || 0} Menit`,
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      render: (text) => (
        <span className="text-truncate" style={{ maxWidth: "150px" }}>
          {text || "—"}
        </span>
      ),
    },
    {
      title: "Best Seller",
      dataIndex: "is_best_seller",
      render: (val) => (
        <span className={`badge ${val ? "badge-linesuccess" : "badge-linedanger"}`}>
          {val ? "Ya" : "Tidak"}
        </span>
      ),
    },
    {
      title: "Baru",
      dataIndex: "is_new",
      render: (val) => (
        <span className={`badge ${val ? "badge-linesuccess" : "badge-linedanger"}`}>
          {val ? "Ya" : "Tidak"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      render: (val) => (
        <span className={`badge ${val ? "badge-linesuccess" : "badge-linedanger"}`}>
          {val ? "Aktif" : "Non-Aktif"}
        </span>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <Link className="me-2 p-2" to={route.productdetails}>
              <Eye className="feather-view" />
            </Link>
            <Link className="me-2 p-2" to={route.editproduct}>
              <Edit className="feather-edit" />
            </Link>
            <Link className="confirm-text p-2" to="#" onClick={() => showConfirmationAlert(record.id)}>
              <Trash2 className="feather-trash-2" />
            </Link>
          </div>
        </td>
      ),
    },
  ];

  const MySwal = withReactContent(Swal);
  const showConfirmationAlert = (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonColor: "#00ff00",
      confirmButtonText: "Yes, delete it!",
      cancelButtonColor: "#ff0000",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/products/${id}`);
          await fetchProducts();
          MySwal.fire("Deleted!", "Product has been deleted.", "success");
        } catch (err) {
          MySwal.fire("Error", "Gagal menghapus produk", "error");
        }
      }
    });
  };

  const toggleFilterVisibility = () => setIsFilterVisible((prev) => !prev);

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Product List</h4>
              <h6>Manage your products</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <li>
              <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "PDF")}>
                <Link onClick={exportToPDF}>
                  <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Excel")}>
                <Link onClick={exportToExcel}>
                  <ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Print")}>
                <Link onClick={handlePrint}>
                  <i data-feather="printer" className="feather-printer" />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Refresh")}>
                <Link onClick={handleRefresh}>
                  <RotateCcw />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Collapse")}>
                <Link
                  id="collapse-header"
                  className={data ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(setToogleHeader(!data));
                  }}
                >
                  <ChevronUp />
                </Link>
              </OverlayTrigger>
            </li>
          </ul>
          <div className="page-btn">
            <Link to={route.addproduct} className="btn btn-added">
              <PlusCircle className="me-2 iconsize" />
              Add New Product
            </Link>
          </div>
          <div className="page-btn import">
            <Link to="#" className="btn btn-added color" data-bs-toggle="modal" data-bs-target="#view-notes">
              <Download className="me-2" />
              Import Product
            </Link>
          </div>
        </div>

        <div className="card table-list-card">
          <div className="card-body">
            <div className="table-top">
              <div className="search-set">
                <div className="search-input">
                  <input
                    type="text"
                    placeholder="Search"
                    className="form-control form-control-sm formsearch"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Link className="btn btn-searchset">
                    <i data-feather="search" className="feather-search" />
                  </Link>
                </div>
              </div>
              <div className="search-path">
                <Link className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`} onClick={toggleFilterVisibility}>
                  <Filter className="filter-icon" />
                  <span>
                    <ImageWithBasePath src="assets/img/icons/closes.svg" alt="img" />
                  </span>
                </Link>
              </div>
              <div className="form-sort">
                <Sliders className="info-img" />
                <Select
                  className="select"
                  options={sortOptions}
                  placeholder="Sort by Date"
                  value={sortOption}
                  onChange={setSortOption}
                  isClearable
                />
              </div>
            </div>

            {/* Panel Filter */}
            <div
              className={`card${isFilterVisible ? " visible" : ""}`}
              id="filter_inputs"
              style={{ display: isFilterVisible ? "block" : "none" }}
            >
              <div className="card-body pb-0">
                <div className="row">
                  <div className="col-lg-12 col-sm-12">
                    <div className="row">
                      <div className="col-lg-2 col-sm-6 col-12">
                        <div className="input-blocks">
                          <Box className="info-img" />
                          <Select
                            className="select"
                            options={productlist}
                            placeholder="Choose Product"
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            isClearable
                          />
                        </div>
                      </div>
                      <div className="col-lg-2 col-sm-6 col-12">
                        <div className="input-blocks">
                          <StopCircle className="info-img" />
                          <Select
                            className="select"
                            options={categorylist}
                            placeholder="Choose Category"
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            isClearable
                          />
                        </div>
                      </div>
                      <div className="col-lg-2 col-sm-6 col-12">
                        <div className="input-blocks">
                          <GitMerge className="info-img" />
                          <Select
                            className="select"
                            options={subcategorylist}
                            placeholder="Choose Sub Category"
                            value={selectedSubCategory}
                            onChange={setSelectedSubCategory}
                            isClearable
                          />
                        </div>
                      </div>
                      <div className="col-lg-2 col-sm-6 col-12">
                        <div className="input-blocks">
                          <StopCircle className="info-img" />
                          <Select
                            className="select"
                            options={brandlist}
                            placeholder="Choose Brand"
                            value={selectedBrand}
                            onChange={setSelectedBrand}
                            isClearable
                          />
                        </div>
                      </div>
                      <div className="col-lg-2 col-sm-6 col-12">
                        <div className="input-blocks">
                          <i className="fas fa-money-bill info-img" />
                          <Select
                            className="select"
                            options={priceOptions}
                            placeholder="Price"
                            value={selectedPrice}
                            onChange={setSelectedPrice}
                            isClearable
                          />
                        </div>
                      </div>
                      <div className="col-lg-2 col-sm-6 col-12">
                        <div className="input-blocks">
                          <Link className="btn btn-filters ms-auto" onClick={handleSearchClick}>
                            <i data-feather="search" className="feather-search" /> Search
                          </Link>
                          <Link className="btn btn-filters ms-auto" onClick={resetFilters} style={{ marginLeft: "5px" }}>
                            Reset
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <Table columns={columns} dataSource={filteredProducts} loading={loading} />
            </div>
          </div>
        </div>
        <Brand />
      </div>
    </div>
  );
};

export default ProductList;