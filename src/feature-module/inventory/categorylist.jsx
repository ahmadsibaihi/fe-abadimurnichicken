import React, { useState, useEffect, useCallback } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ImageWithBasePath from '../../core/img/imagewithbasebath';
import { Link } from 'react-router-dom';
import { ChevronUp, Filter, PlusCircle, RotateCcw, Sliders, StopCircle } from 'feather-icons-react/build/IconComponents';
import { useDispatch, useSelector } from 'react-redux';
import { setToogleHeader } from '../../core/redux/action';
import Select from 'react-select';
import { DatePicker } from 'antd';
import AddCategoryList from '../../core/modals/inventory/addcategorylist';
import EditCategoryList from '../../core/modals/inventory/editcategorylist';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Table from '../../core/pagination/datatable';
import axios from 'axios';
import * as XLSX from 'xlsx'; // untuk export excel
import jsPDF from 'jspdf'; // untuk export PDF
import 'jspdf-autotable'; // plugin tabel untuk jsPDF

const BASE_URL = "http://localhost:3000/api/v1";

const CategoryList = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.toggle_header);

    // State data & loading
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    // State filter & search
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [dateFilter, setDateFilter] = useState(null);

    // Filter visibility
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const toggleFilterVisibility = () => setIsFilterVisible(prev => !prev);

    // Fetch categories dengan filter query
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            // Bangun query params
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter?.value === 'active') params.append('is_active', true);
            if (statusFilter?.value === 'inactive') params.append('is_active', false);
            if (dateFilter) params.append('created_at', dateFilter.format('YYYY-MM-DD'));

            const url = `${BASE_URL}/categories${params.toString() ? `?${params.toString()}` : ''}`;
            const res = await axios.get(url);
            setDataSource(res.data || []);
        } catch (err) {
            console.error("Gagal fetch categories:", err);
            Swal.fire('Error', 'Gagal memuat data kategori', 'error');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter, dateFilter]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Auto-refresh setiap 30 detik (realtime sederhana)
    useEffect(() => {
        const interval = setInterval(() => {
            fetchCategories();
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchCategories]);

    // Handler search dengan debounce
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handler filter status
    const handleStatusFilterChange = (selected) => {
        setStatusFilter(selected);
    };

    // Handler filter tanggal
    const handleDateFilterChange = (date) => {
        setDateFilter(date);
    };

    // Reset semua filter
    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter(null);
        setDateFilter(null);
    };

    // Export ke Excel
    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(dataSource.map(item => ({
            'Nama Kategori': item.name,
            'Status': item.is_active ? 'Aktif' : 'Tidak Aktif',
            'Dibuat': item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : ''
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');
        XLSX.writeFile(workbook, `categories_${new Date().toISOString().slice(0,19)}.xlsx`);
    };

    // Export ke PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Daftar Kategori', 14, 10);
        const tableData = dataSource.map(item => [
            item.name,
            item.is_active ? 'Aktif' : 'Tidak Aktif',
            item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : ''
        ]);
        doc.autoTable({
            head: [['Nama Kategori', 'Status', 'Dibuat']],
            body: tableData,
            startY: 20,
        });
        doc.save(`categories_${new Date().toISOString().slice(0,19)}.pdf`);
    };

    // Print (menggunakan window print dengan styling)
    const handlePrint = async () => {
        const printContent = document.querySelector('.table-responsive').cloneNode(true);
        const originalTitle = document.title;
        document.title = 'Daftar Kategori';
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head><title>Daftar Kategori</title>
                <link rel="stylesheet" href="${window.location.origin}/assets/css/bootstrap.min.css">
                </head>
                <body>${printContent.outerHTML}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
        document.title = originalTitle;
    };

    // Konfigurasi dropdown untuk filter status
    const statusOptions = [
        { value: 'active', label: 'Aktif' },
        { value: 'inactive', label: 'Tidak Aktif' },
    ];

    const oldandlatestvalue = [
        { value: 'date', label: 'Sort by Date' },
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
    ];

    // Render tooltips
    const renderTooltip = (props, text) => <Tooltip {...props}>{text}</Tooltip>;

    // Kolom tabel (actions sudah ada)
    const columns = [
        { title: "Nama Kategori", dataIndex: "name", sorter: (a,b) => a.name.localeCompare(b.name) },
        {
            title: "Status",
            dataIndex: "is_active",
            render: (val) => (
                <span className={`badge ${val ? "badge-linesuccess" : "badge-linedanger"}`}>
                    <Link to="#">{val ? "Aktif" : "Tidak Aktif"}</Link>
                </span>
            ),
            sorter: (a,b) => a.is_active - b.is_active,
        },
        {
            title: "Dibuat",
            dataIndex: "created_at",
            render: (val) => val ? new Date(val).toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" }) : "—",
            sorter: (a,b) => new Date(a.created_at) - new Date(b.created_at),
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            render: (_, record) => (
                <td className="action-table-data">
                    <div className="edit-delete-action">
                        <Link className="me-2 p-2" to="#" data-bs-toggle="modal" data-bs-target="#edit-category">
                            <i data-feather="edit" className="feather-edit"></i>
                        </Link>
                        <Link className="confirm-text p-2" to="#" onClick={() => showConfirmationAlert(record.id)}>
                            <i data-feather="trash-2" className="feather-trash-2"></i>
                        </Link>
                    </div>
                </td>
            )
        },
    ];

    const MySwal = withReactContent(Swal);
    const showConfirmationAlert = (id) => {
        MySwal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonColor: '#00ff00',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonColor: '#ff0000',
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${BASE_URL}/categories/${id}`);
                    await fetchCategories();
                    MySwal.fire('Deleted!', 'Category has been deleted.', 'success');
                } catch (err) {
                    MySwal.fire('Error', 'Gagal menghapus kategori', 'error');
                }
            }
        });
    };

    return (
        <div>
            <div className="page-wrapper">
                <div className="content">
                    <div className="page-header">
                        <div className="add-item d-flex">
                            <div className="page-title">
                                <h4>Category</h4>
                                <h6>Manage your categories</h6>
                            </div>
                        </div>
                        <ul className="table-top-head">
                            <li>
                                <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, 'PDF')}>
                                    <Link onClick={exportToPDF}>
                                        <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, 'Excel')}>
                                    <Link onClick={exportToExcel}>
                                        <ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, 'Print')}>
                                    <Link onClick={handlePrint}>
                                        <i data-feather="printer" className="feather-printer" />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, 'Refresh')}>
                                    <Link onClick={fetchCategories}>
                                        <RotateCcw />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                            <li>
                                <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, 'Collapse')}>
                                    <Link
                                        id="collapse-header"
                                        className={data ? "active" : ""}
                                        onClick={() => dispatch(setToogleHeader(!data))}
                                    >
                                        <ChevronUp />
                                    </Link>
                                </OverlayTrigger>
                            </li>
                        </ul>
                        <div className="page-btn">
                            <Link to="#" className="btn btn-added" data-bs-toggle="modal" data-bs-target="#add-category">
                                <PlusCircle className="me-2" /> Add New Category
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
                                            onChange={handleSearchChange}
                                        />
                                        <Link className="btn btn-searchset">
                                            <i data-feather="search" className="feather-search" />
                                        </Link>
                                    </div>
                                </div>
                                <div className="search-path">
                                    <Link className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`} onClick={toggleFilterVisibility}>
                                        <Filter className="filter-icon" />
                                        <span><ImageWithBasePath src="assets/img/icons/closes.svg" alt="img" /></span>
                                    </Link>
                                </div>
                                <div className="form-sort">
                                    <Sliders className="info-img" />
                                    <Select className="select" options={oldandlatestvalue} placeholder="Newest" />
                                </div>
                            </div>

                            {/* Filter Panel */}
                            <div className={`card${isFilterVisible ? " visible" : ""}`} id="filter_inputs" style={{ display: isFilterVisible ? "block" : "none" }}>
                                <div className="card-body pb-0">
                                    <div className="row">
                                        <div className="col-lg-3 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <i data-feather="calendar" className="info-img" />
                                                <DatePicker
                                                    onChange={handleDateFilterChange}
                                                    className="filterdatepicker"
                                                    placeholder="Pilih Tanggal"
                                                    format="DD-MM-YYYY"
                                                    allowClear
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <StopCircle className="info-img" />
                                                <Select
                                                    options={statusOptions}
                                                    className="select"
                                                    placeholder="Pilih Status"
                                                    isClearable
                                                    value={statusFilter}
                                                    onChange={handleStatusFilterChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6 col-12 ms-auto">
                                            <div className="input-blocks">
                                                <Link className="btn btn-filters ms-auto" onClick={resetFilters}>
                                                    Reset Filter
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <Table columns={columns} dataSource={dataSource} loading={loading} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AddCategoryList onSuccess={fetchCategories} />
            <EditCategoryList />
        </div>
    );
};

export default CategoryList;