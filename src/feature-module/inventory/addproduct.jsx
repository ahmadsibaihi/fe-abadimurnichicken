import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { all_routes } from "../../Router/all_routes";
import Addunits from "../../core/modals/inventory/addunits";
import AddBrand from "../../core/modals/addbrand";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
  LifeBuoy,
  List,
  PlusCircle,
  Trash2,
  X,
} from "feather-icons-react/build/IconComponents";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

const AddProduct = () => {
  const route = all_routes;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const data = useSelector((state) => state.toggle_header);

  // ─── Form data produk ───
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    cooking_time: "",
    category_id: "",
    is_best_seller: false,
    is_new: false,
    is_active: true,
    supports_spicy: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ─── Categories ───
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ─── Modal add category ───
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", icon: "", sort_order: 0, is_active: true });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

  // ─── Variants (inline) ───
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({ name: "", additional_price: "" });

  // ─── Addons ───
  const [addonOptions, setAddonOptions] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [newAddon, setNewAddon] = useState({ name: "", price: "" });
  const [addonLoading, setAddonLoading] = useState(false);

  // ─── Fetch categories ───
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/categories`);
      const options = res.data.map((cat) => ({
        value: cat.id,
        label: `${cat.icon || ""} ${cat.name}`.trim(),
      }));
      setCategoryOptions(options);
    } catch (err) {
      console.error("Gagal fetch categories:", err);
    }
  };

  // ─── Fetch addons ───
  const fetchAddons = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/addons`);
      const options = res.data.map((addon) => ({
        value: addon.id,
        label: `${addon.name} (+Rp ${addon.price.toLocaleString("id-ID")})`,
      }));
      setAddonOptions(options);
    } catch (err) {
      console.error("Gagal fetch addons:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAddons();
  }, []);

  // ─── Handle form change ───
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ─── Handle image ───
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // ─── Handle add category (modal) ───
  const handleSaveCategory = async () => {
    setCategoryLoading(true);
    setCategoryError(null);
    try {
      await axios.post(`${BASE_URL}/categories`, newCategory);
      await fetchCategories(); // refresh dropdown
      setNewCategory({ name: "", icon: "", sort_order: 0, is_active: true });
      setShowCategoryModal(false);
    } catch (err) {
      setCategoryError(err.response?.data?.error || "Gagal menyimpan kategori");
    } finally {
      setCategoryLoading(false);
    }
  };

  // ─── Handle variants (inline) ───
  const handleAddVariant = () => {
    if (!newVariant.name.trim()) return;
    setVariants((prev) => [
      ...prev,
      { name: newVariant.name, additional_price: parseFloat(newVariant.additional_price) || 0 },
    ]);
    setNewVariant({ name: "", additional_price: "" });
  };
  const handleRemoveVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Handle add addon (modal) ───
  const handleSaveAddon = async () => {
    setAddonLoading(true);
    try {
      await axios.post(`${BASE_URL}/addons`, {
        name: newAddon.name,
        price: parseFloat(newAddon.price) || 0,
        is_active: true,
      });
      await fetchAddons(); // refresh dropdown
      setNewAddon({ name: "", price: "" });
      setShowAddonModal(false);
    } catch (err) {
      console.error("Gagal simpan addon:", err);
    } finally {
      setAddonLoading(false);
    }
  };

  // ─── Submit produk ───
  const handleSubmit = async () => {
    if (!formData.name) return setError("Nama produk wajib diisi");
    if (!formData.category_id) return setError("Kategori wajib dipilih");
    if (!formData.price) return setError("Harga wajib diisi");

    setLoading(true);
    setError(null);
    try {
      // 1. Simpan produk
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("price", formData.price);
      payload.append("stock", formData.stock);
      payload.append("cooking_time", formData.cooking_time);
      payload.append("category_id", formData.category_id);
      payload.append("is_best_seller", formData.is_best_seller.toString());
      payload.append("is_new", formData.is_new.toString());
      payload.append("is_active", formData.is_active.toString());
      payload.append("supports_spicy", formData.supports_spicy.toString());
      if (imageFile) payload.append("image", imageFile);

      const res = await axios.post(`${BASE_URL}/products`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const productId = res.data.id;

      // 2. Simpan variants
      for (const variant of variants) {
        await axios.post(`${BASE_URL}/products/${productId}/variants`, variant);
      }

      // 3. Assign addons
      for (const addon of selectedAddons) {
        await axios.post(`${BASE_URL}/products/${productId}/addons/${addon.value}`);
      }

      setSuccess(true);
      setTimeout(() => navigate(route.productlist), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Gagal menyimpan produk");
    } finally {
      setLoading(false);
    }
  };

  const renderCollapseTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>Collapse</Tooltip>
  );

  return (
    <div className="page-wrapper">
      <div className="content">

        {/* MODAL ADD CATEGORY */}
        {showCategoryModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Tambah Kategori Baru</h5>
                  <button className="btn-close" onClick={() => setShowCategoryModal(false)} />
                </div>
                <div className="modal-body">
                  {categoryError && <div className="alert alert-danger">❌ {categoryError}</div>}
                  <div className="mb-3">
                    <label className="form-label">Nama Kategori <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Contoh: Ayam Goreng"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Icon <small className="text-muted">(emoji)</small></label>
                    <input
                      type="text"
                      className="form-control"
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory((p) => ({ ...p, icon: e.target.value }))}
                      placeholder="Contoh: 🍗"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Urutan</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newCategory.sort_order}
                      onChange={(e) => setNewCategory((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                      min="0"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="checkboxs d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={newCategory.is_active}
                        onChange={(e) => setNewCategory((p) => ({ ...p, is_active: e.target.checked }))}
                      />
                      <span className="checkmarks" />
                      Aktif
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-cancel" onClick={() => setShowCategoryModal(false)}>Batal</button>
                  <button className="btn btn-submit" onClick={handleSaveCategory} disabled={categoryLoading}>
                    {categoryLoading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ADD ADDON */}
        {showAddonModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Tambah Addon Baru</h5>
                  <button className="btn-close" onClick={() => setShowAddonModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nama Addon <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAddon.name}
                      onChange={(e) => setNewAddon((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Contoh: Extra Sambal"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Harga Tambahan</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newAddon.price}
                      onChange={(e) => setNewAddon((p) => ({ ...p, price: e.target.value }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-cancel" onClick={() => setShowAddonModal(false)}>Batal</button>
                  <button className="btn btn-submit" onClick={handleSaveAddon} disabled={addonLoading}>
                    {addonLoading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>New Product</h4>
              <h6>Create new product</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <li>
              <div className="page-btn">
                <Link to={route.productlist} className="btn btn-secondary">
                  <ArrowLeft className="me-2" />
                  Back to Product
                </Link>
              </div>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                <Link
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Collapse"
                  id="collapse-header"
                  className={data ? "active" : ""}
                  onClick={() => dispatch(setToogleHeader(!data))}
                >
                  <ChevronUp className="feather-chevron-up" />
                </Link>
              </OverlayTrigger>
            </li>
          </ul>
        </div>

        {/* Alert */}
        {success && <div className="alert alert-success">✅ Produk berhasil disimpan! Mengalihkan...</div>}
        {error && <div className="alert alert-danger">❌ {error}</div>}

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="card">
            <div className="card-body add-product pb-0">

              {/* PRODUCT INFORMATION */}
              <div className="accordion-card-one accordion" id="accordionExample">
                <div className="accordion-item">
                  <div className="accordion-header" id="headingOne">
                    <div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-controls="collapseOne">
                      <div className="addproduct-icon">
                        <h5><Info className="add-info" /><span>Product Information</span></h5>
                        <Link to="#"><ChevronDown className="chevron-down-add" /></Link>
                      </div>
                    </div>
                  </div>
                  <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                    <div className="accordion-body">

                      {/* Product Name & Description */}
                      <div className="row">
                        <div className="col-lg-6 col-sm-6 col-12">
                          <div className="mb-3 add-product">
                            <label className="form-label">Product Name <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              className="form-control"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="Contoh: Ayam Geprek"
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-sm-6 col-12">
                          <div className="mb-3 add-product">
                            <label className="form-label">Cooking Time <small className="text-muted">(menit)</small></label>
                            <input
                              type="number"
                              className="form-control"
                              name="cooking_time"
                              value={formData.cooking_time}
                              onChange={handleChange}
                              placeholder="Contoh: 10"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-12">
                        <div className="input-blocks summer-description-box transfer mb-3">
                          <label>Description</label>
                          <textarea
                            className="form-control h-100"
                            rows={3}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Deskripsi produk..."
                          />
                        </div>
                      </div>

                      {/* Category with Add New */}
                      <div className="row">
                        <div className="col-lg-6 col-sm-6 col-12">
                          <div className="mb-3 add-product">
                            <div className="add-newplus">
                              <label className="form-label">Category <span className="text-danger">*</span></label>
                              <Link to="#" onClick={() => setShowCategoryModal(true)}>
                                <PlusCircle className="plus-down-add" />
                                <span>Add New</span>
                              </Link>
                            </div>
                            <Select
                              className="select"
                              options={categoryOptions}
                              value={selectedCategory}
                              placeholder="Pilih Kategori"
                              onChange={(selected) => {
                                setSelectedCategory(selected);
                                setFormData((prev) => ({ ...prev, category_id: selected?.value || "" }));
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Tags & Spicy Support */}
                      <div className="row">
                        <div className="col-lg-12">
                          <div className="mb-3 add-product">
                            <label className="form-label">Tags & Features</label>
                            <div className="d-flex flex-wrap gap-4 mt-2">
                              <label className="checkboxs d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                                <input type="checkbox" name="is_best_seller" checked={formData.is_best_seller} onChange={handleChange} />
                                <span className="checkmarks" /> 🔥 Best Seller
                              </label>
                              <label className="checkboxs d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                                <input type="checkbox" name="is_new" checked={formData.is_new} onChange={handleChange} />
                                <span className="checkmarks" /> ✨ New
                              </label>
                              <label className="checkboxs d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                                <span className="checkmarks" /> ✅ Aktif
                              </label>
                              <label className="checkboxs d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                                <input type="checkbox" name="supports_spicy" checked={formData.supports_spicy} onChange={handleChange} />
                                <span className="checkmarks" /> 🌶️ Supports Spicy Levels
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* PRICING & STOCKS */}
              <div className="accordion-card-one accordion" id="accordionExample2">
                <div className="accordion-item">
                  <div className="accordion-header" id="headingTwo">
                    <div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-controls="collapseTwo">
                      <div className="text-editor add-list">
                        <div className="addproduct-icon list icon">
                          <h5><LifeBuoy className="add-info" /><span>Pricing &amp; Stocks</span></h5>
                          <Link to="#"><ChevronDown className="chevron-down-add" /></Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id="collapseTwo" className="accordion-collapse collapse show" aria-labelledby="headingTwo" data-bs-parent="#accordionExample2">
                    <div className="accordion-body">
                      <div className="row">
                        <div className="col-lg-6 col-sm-6 col-12">
                          <div className="input-blocks add-product">
                            <label>Stock (Quantity) <span className="text-danger">*</span></label>
                            <input type="number" className="form-control" name="stock" value={formData.stock} onChange={handleChange} placeholder="0" min="0" />
                          </div>
                        </div>
                        <div className="col-lg-6 col-sm-6 col-12">
                          <div className="input-blocks add-product">
                            <label>Price <span className="text-danger">*</span></label>
                            <input type="number" className="form-control" name="price" value={formData.price} onChange={handleChange} placeholder="0" min="0" />
                          </div>
                        </div>
                      </div>

                      {/* Images */}
                      <div className="accordion-card-one accordion" id="accordionExample3">
                        <div className="accordion-item">
                          <div className="accordion-header" id="headingThree">
                            <div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-controls="collapseThree">
                              <div className="addproduct-icon list">
                                <h5><i data-feather="image" className="add-info" /><span>Images</span></h5>
                                <Link to="#"><ChevronDown className="chevron-down-add" /></Link>
                              </div>
                            </div>
                          </div>
                          <div id="collapseThree" className="accordion-collapse collapse show" aria-labelledby="headingThree" data-bs-parent="#accordionExample3">
                            <div className="accordion-body">
                              <div className="text-editor add-list add">
                                <div className="col-lg-12">
                                  <div className="add-choosen">
                                    <div className="input-blocks">
                                      <div className="image-upload">
                                        <input type="file" accept="image/*" onChange={handleImageChange} />
                                        <div className="image-uploads">
                                          <PlusCircle className="plus-down-add me-0" />
                                          <h4>Add Images</h4>
                                        </div>
                                      </div>
                                    </div>
                                    {imagePreview && (
                                      <div className="phone-img">
                                        <img src={imagePreview} alt="preview" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }} />
                                        <Link to="#"><X className="x-square-add remove-product" onClick={handleRemoveImage} /></Link>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* VARIANTS (INLINE) */}
              <div className="accordion-card-one accordion" id="accordionVariant">
                <div className="accordion-item">
                  <div className="accordion-header" id="headingVariant">
                    <div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseVariant">
                      <div className="text-editor add-list">
                        <div className="addproduct-icon list icon">
                          <h5><List className="add-info" /><span>Variants</span></h5>
                          <Link to="#"><ChevronDown className="chevron-down-add" /></Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id="collapseVariant" className="accordion-collapse collapse show">
                    <div className="accordion-body">
                      {/* Input tambah variant */}
                      <div className="row align-items-end mb-3">
                        <div className="col-lg-5 col-sm-5 col-12">
                          <div className="input-blocks add-product">
                            <label>Nama Variant</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newVariant.name}
                              onChange={(e) => setNewVariant((p) => ({ ...p, name: e.target.value }))}
                              placeholder="Contoh: Sambal Ijo"
                            />
                          </div>
                        </div>
                        <div className="col-lg-4 col-sm-4 col-12">
                          <div className="input-blocks add-product">
                            <label>Harga Tambahan</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newVariant.additional_price}
                              onChange={(e) => setNewVariant((p) => ({ ...p, additional_price: e.target.value }))}
                              placeholder="0"
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="col-lg-3 col-sm-3 col-12">
                          <button type="button" className="btn btn-submit w-100" onClick={handleAddVariant}>
                            <PlusCircle size={16} className="me-1" /> Tambah
                          </button>
                        </div>
                      </div>
                      {/* List variant yang sudah ditambah */}
                      {variants.length > 0 && (
                        <div className="table-responsive">
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Nama Variant</th>
                                <th>Harga Tambahan</th>
                                <th className="no-sort">Hapus</th>
                              </tr>
                            </thead>
                            <tbody>
                              {variants.map((v, i) => (
                                <tr key={i}>
                                  <td>{v.name}</td>
                                  <td>+Rp {v.additional_price.toLocaleString("id-ID")}</td>
                                  <td>
                                    <Link to="#" className="confirm-text p-2" onClick={() => handleRemoveVariant(i)}>
                                      <Trash2 className="feather-trash-2" />
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {variants.length === 0 && (
                        <p className="text-muted text-center">Belum ada variant. Tambahkan di atas.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ADDONS */}
              <div className="accordion-card-one accordion" id="accordionAddon">
                <div className="accordion-item">
                  <div className="accordion-header" id="headingAddon">
                    <div className="accordion-button" data-bs-toggle="collapse" data-bs-target="#collapseAddon">
                      <div className="text-editor add-list">
                        <div className="addproduct-icon list icon">
                          <h5><PlusCircle className="add-info" /><span>Addons / Topping</span></h5>
                          <Link to="#"><ChevronDown className="chevron-down-add" /></Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id="collapseAddon" className="accordion-collapse collapse show">
                    <div className="accordion-body">
                      <div className="row align-items-end">
                        <div className="col-lg-9 col-sm-9 col-12">
                          <div className="mb-3 add-product">
                            <div className="add-newplus">
                              <label className="form-label">Pilih Addon</label>
                              <Link to="#" onClick={() => setShowAddonModal(true)}>
                                <PlusCircle className="plus-down-add" />
                                <span>Add New</span>
                              </Link>
                            </div>
                            <Select
                              className="select"
                              options={addonOptions}
                              isMulti
                              value={selectedAddons}
                              placeholder="Pilih addon untuk produk ini..."
                              onChange={(selected) => setSelectedAddons(selected || [])}
                            />
                          </div>
                        </div>
                      </div>
                      {selectedAddons.length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mt-1">
                          {selectedAddons.map((a) => (
                            <span key={a.value} className="badge bg-light text-dark border px-3 py-2">
                              {a.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Buttons */}
          <div className="col-lg-12">
            <div className="btn-addproduct mb-4">
              <button type="button" className="btn btn-cancel me-2" onClick={() => navigate(route.productlist)}>
                Cancel
              </button>
              <button type="button" className="btn btn-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? "Menyimpan..." : "Save Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
      <Addunits />
      <AddBrand />
    </div>
  );
};

export default AddProduct;