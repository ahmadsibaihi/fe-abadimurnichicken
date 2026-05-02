import React, { useState, useEffect, useCallback } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import { Link } from "react-router-dom";
import { ChevronUp, Filter, PlusCircle, RotateCcw, Sliders, StopCircle } from "feather-icons-react/build/IconComponents";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import Select from "react-select";
import { DatePicker, Modal, Table as AntTable, InputNumber } from "antd";
import Swal from "sweetalert2";
import Table from "../../core/pagination/datatable";
import API from "../../api/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

const ExpenditureList = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [selectedExpenditure, setSelectedExpenditure] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState("karyawan");
  const [formData, setFormData] = useState({
    date: moment().format("YYYY-MM-DD"),
    amount: "",
    category: "",
    description: "",
    receipt_url: "",
    recipient_user_id: "",
    recipient_name: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editSelectedFile, setEditSelectedFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);

  // State untuk dropdown penerima (hanya admin)
  const [recipientType, setRecipientType] = useState("self"); // self, staff, other
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [manualRecipientName, setManualRecipientName] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "karyawan";
    setCurrentUserRole(role);
  }, []);

  // Fetch daftar karyawan jika role admin/superadmin
  useEffect(() => {
    if (currentUserRole !== "karyawan") {
      API.get("/v1/users/karyawan")
        .then((res) => setStaffList(res.data))
        .catch((err) => console.error("Gagal ambil karyawan", err));
    }
  }, [currentUserRole]);

  const fetchExpenditures = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter?.value) params.append("status", statusFilter.value);
      if (dateFilter) params.append("date", dateFilter.format("YYYY-MM-DD"));

      const url = `/v1/expenditures${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await API.get(url);
      setDataSource(res.data || []);
    } catch (err) {
      console.error("Gagal fetch expenditures:", err);
      Swal.fire("Error", "Gagal memuat data pengeluaran", "error");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, dateFilter]);

  useEffect(() => {
    fetchExpenditures();
  }, [fetchExpenditures]);

  useEffect(() => {
    const interval = setInterval(fetchExpenditures, 30000);
    return () => clearInterval(interval);
  }, [fetchExpenditures]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
    setDateFilter(null);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditSelectedFile(file);
      setEditPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({
      date: moment().format("YYYY-MM-DD"),
      amount: "",
      category: "",
      description: "",
      receipt_url: "",
      recipient_user_id: "",
      recipient_name: "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditSelectedFile(null);
    setEditPreviewUrl(null);
    setRecipientType("self");
    setSelectedStaffId("");
    setManualRecipientName("");
  };

  const handleAddExpenditure = async () => {
    if (!formData.amount || !formData.category) {
      Swal.fire("Error", "Jumlah dan kategori wajib diisi", "error");
      return;
    }
    if (currentUserRole === "karyawan" && !selectedFile) {
      Swal.fire("Error", "Bukti struk wajib diupload", "error");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("date", formData.date);
    formDataObj.append("amount", parseFloat(formData.amount));
    formDataObj.append("category", formData.category);
    formDataObj.append("description", formData.description);
    formDataObj.append("receipt_url", formData.receipt_url);
    if (selectedFile) {
      formDataObj.append("receipt_image", selectedFile);
    }

    // Tentukan recipient
    let recipientUserId = "";
    let recipientName = "";
    if (currentUserRole !== "karyawan") {
      if (recipientType === "self") {
        // backend akan isi default
      } else if (recipientType === "staff") {
        recipientUserId = selectedStaffId;
      } else {
        recipientName = manualRecipientName;
      }
    }
    formDataObj.append("recipient_user_id", recipientUserId);
    formDataObj.append("recipient_name", recipientName);

    try {
      const res = await API.post("/v1/expenditures", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 201) {
        Swal.fire("Sukses", "Pengeluaran berhasil ditambahkan", "success");
        setModalVisible(false);
        resetForm();
        fetchExpenditures();
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.error || "Gagal menambah pengeluaran", "error");
    }
  };

  const handleEditExpenditure = async () => {
    const formDataObj = new FormData();
    formDataObj.append("amount", parseFloat(formData.amount));
    formDataObj.append("category", formData.category);
    formDataObj.append("description", formData.description);
    if (editSelectedFile) {
      formDataObj.append("receipt_image", editSelectedFile);
    }
    if (formData.receipt_url) {
      formDataObj.append("receipt_url", formData.receipt_url);
    }
    try {
      await API.put(`/v1/expenditures/${selectedExpenditure.id}`, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Sukses", "Pengeluaran berhasil diupdate", "success");
      setEditModalVisible(false);
      resetForm();
      fetchExpenditures();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Gagal update", "error");
    }
  };

  const handleDelete = (id, currentStatus) => {
    if (currentStatus === "approved") {
      Swal.fire("Peringatan", "Pengeluaran yang sudah approved tidak dapat dihapus", "warning");
      return;
    }
    Swal.fire({
      title: "Yakin hapus?",
      text: "Data akan dihapus secara permanen (soft delete)",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/v1/expenditures/${id}`);
          Swal.fire("Terhapus!", "Pengeluaran telah dihapus.", "success");
          fetchExpenditures();
        } catch (err) {
          Swal.fire("Error", err.response?.data?.error, "error");
        }
      }
    });
  };

  const handleApprove = (id) => {
    Swal.fire({
      title: "Setujui pengeluaran?",
      text: "Pastikan data sudah benar, karena tidak bisa diubah lagi",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      confirmButtonText: "Ya, Setujui",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.post(`/v1/expenditures/${id}/approve`);
          Swal.fire("Disetujui!", "Pengeluaran telah approved.", "success");
          fetchExpenditures();
        } catch (err) {
          Swal.fire("Error", err.response?.data?.error, "error");
        }
      }
    });
  };

  const fetchAuditLogs = async (id) => {
    try {
      const res = await API.get(`/v1/expenditures/${id}/audit-logs`);
      setAuditLogs(res.data);
      setAuditModalVisible(true);
    } catch (err) {
      Swal.fire("Info", "Riwayat perubahan belum tersedia", "info");
    }
  };

  const openEditModal = (record) => {
    if (record.status !== "pending") {
      Swal.fire("Informasi", "Hanya pengeluaran dengan status pending yang bisa diedit", "info");
      return;
    }
    setSelectedExpenditure(record);
    setFormData({
      date: moment(record.date).format("YYYY-MM-DD"),
      amount: record.amount,
      category: record.category,
      description: record.description,
      receipt_url: record.receipt_url || "",
      recipient_user_id: record.recipient_user_id || "",
      recipient_name: record.recipient_name || "",
    });
    setEditModalVisible(true);
  };

  const exportToExcel = () => {
    const exportData = dataSource.map((item) => ({
      Tanggal: moment(item.date).format("DD/MM/YYYY"),
      Kategori: item.category,
      Deskripsi: item.description,
      Jumlah: item.amount,
      Penerima: item.recipient_name || (item.recipient_user_id ? staffList.find((s) => s.id === item.recipient_user_id)?.name : "-"),
      Status: item.status === "pending" ? "Menunggu" : "Disetujui",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pengeluaran");
    XLSX.writeFile(wb, `pengeluaran_${moment().format("YYYYMMDD_HHmmss")}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Pengeluaran", 14, 10);
    const tableData = dataSource.map((item) => [
      moment(item.date).format("DD/MM/YYYY"),
      item.category,
      item.description,
      `Rp ${item.amount.toLocaleString()}`,
      item.recipient_name || (item.recipient_user_id ? staffList.find((s) => s.id === item.recipient_user_id)?.name : "-"),
      item.status === "pending" ? "Menunggu" : "Disetujui",
    ]);
    doc.autoTable({
      head: [["Tanggal", "Kategori", "Deskripsi", "Jumlah", "Penerima", "Status"]],
      body: tableData,
      startY: 20,
    });
    doc.save(`pengeluaran_${moment().format("YYYYMMDD_HHmmss")}.pdf`);
  };

  const handlePrint = () => {
    const printContent = document.querySelector(".table-responsive").cloneNode(true);
    const originalTitle = document.title;
    document.title = "Laporan Pengeluaran";
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
            <html>
                <head><title>Laporan Pengeluaran</title>
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

  const columns = [
    { title: "Tanggal", dataIndex: "date", render: (val) => moment(val).format("DD/MM/YYYY"), sorter: (a, b) => new Date(a.date) - new Date(b.date) },
    { title: "Kategori", dataIndex: "category", sorter: true },
    { title: "Deskripsi", dataIndex: "description" },
    { title: "Jumlah", dataIndex: "amount", render: (val) => `Rp ${val.toLocaleString()}`, sorter: (a, b) => a.amount - b.amount },
    {
      title: "Penerima",
      dataIndex: "recipient_name",
      render: (_, record) => {
        if (record.recipient_name) return record.recipient_name;
        if (record.recipient_user_id) {
          const staff = staffList.find((s) => s.id === record.recipient_user_id);
          return staff ? staff.name : `User #${record.recipient_user_id}`;
        }
        return "-";
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (val) => <span className={`badge ${val === "approved" ? "badge-linesuccess" : "badge-linewarning"}`}>{val === "approved" ? "Disetujui" : "Menunggu"}</span>,
    },
    {
      title: "Aksi",
      dataIndex: "actions",
      render: (_, record) => (
        <div className="action-table-data">
          <div className="edit-delete-action">
            {record.status === "pending" && (
              <Link className="me-2 p-2" to="#" onClick={() => openEditModal(record)}>
                <i data-feather="edit" className="feather-edit"></i>
              </Link>
            )}
            {currentUserRole !== "karyawan" && record.status === "pending" && (
              <Link className="me-2 p-2" to="#" onClick={() => handleApprove(record.id)}>
                <i data-feather="check-circle" className="feather-check-circle"></i>
              </Link>
            )}
            <Link className="me-2 p-2" to="#" onClick={() => fetchAuditLogs(record.id)}>
              <i data-feather="clock" className="feather-clock"></i>
            </Link>
            <Link className="confirm-text p-2" to="#" onClick={() => handleDelete(record.id, record.status)}>
              <i data-feather="trash-2" className="feather-trash-2"></i>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const statusOptions = [
    { value: "pending", label: "Menunggu" },
    { value: "approved", label: "Disetujui" },
  ];
  const oldandlatestvalue = [{ value: "newest", label: "Terbaru" }, { value: "oldest", label: "Terlama" }];

  const renderTooltip = (props, text) => <Tooltip {...props}>{text}</Tooltip>;
  const toggleFilterVisibility = () => setIsFilterVisible((prev) => !prev);

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Pengeluaran</h4>
                <h6>Kelola pengeluaran harian toko</h6>
              </div>
            </div>
            <ul className="table-top-head">
              <li><OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "PDF")}><Link onClick={exportToPDF}><ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" /></Link></OverlayTrigger></li>
              <li><OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Excel")}><Link onClick={exportToExcel}><ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" /></Link></OverlayTrigger></li>
              <li><OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Print")}><Link onClick={handlePrint}><i data-feather="printer" className="feather-printer" /></Link></OverlayTrigger></li>
              <li><OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Refresh")}><Link onClick={fetchExpenditures}><RotateCcw /></Link></OverlayTrigger></li>
              <li><OverlayTrigger placement="top" overlay={(p) => renderTooltip(p, "Collapse")}><Link id="collapse-header" className={data ? "active" : ""} onClick={() => dispatch(setToogleHeader(!data))}><ChevronUp /></Link></OverlayTrigger></li>
            </ul>
            <div className="page-btn">
              <Link to="#" className="btn btn-added" onClick={() => { resetForm(); setModalVisible(true); }}>
                <PlusCircle className="me-2" /> Tambah Pengeluaran
              </Link>
            </div>
          </div>

          <div className="card table-list-card">
            <div className="card-body">
              <div className="table-top">
                <div className="search-set">
                  <div className="search-input">
                    <input type="text" placeholder="Cari (kategori, deskripsi)" className="form-control form-control-sm formsearch" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <Link className="btn btn-searchset"><i data-feather="search" className="feather-search" /></Link>
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
                  <Select className="select" options={oldandlatestvalue} placeholder="Urutkan" />
                </div>
              </div>

              <div className={`card${isFilterVisible ? " visible" : ""}`} id="filter_inputs" style={{ display: isFilterVisible ? "block" : "none" }}>
                <div className="card-body pb-0">
                  <div className="row">
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <i data-feather="calendar" className="info-img" />
                        <DatePicker onChange={setDateFilter} className="filterdatepicker" placeholder="Pilih Tanggal" format="DD-MM-YYYY" allowClear />
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <StopCircle className="info-img" />
                        <Select options={statusOptions} className="select" placeholder="Pilih Status" isClearable value={statusFilter} onChange={setStatusFilter} />
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12 ms-auto">
                      <div className="input-blocks">
                        <Link className="btn btn-filters ms-auto" onClick={resetFilters}>Reset Filter</Link>
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

      {/* Modal Tambah Pengeluaran */}
      <Modal title="Tambah Pengeluaran" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null} width={600}>
        <div className="modal-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Tanggal</label>
                <DatePicker className="form-control" value={moment(formData.date)} onChange={(date) => handleFormChange("date", date.format("YYYY-MM-DD"))} format="DD-MM-YYYY" style={{ width: "100%" }} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Kategori</label>
                <input type="text" className="form-control" value={formData.category} onChange={(e) => handleFormChange("category", e.target.value)} placeholder="contoh: Bahan Baku, Transport" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Jumlah (Rp)</label>
                <InputNumber className="form-control" value={formData.amount} onChange={(val) => handleFormChange("amount", val)} style={{ width: "100%" }} min={0} prefix="Rp" />
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <label>Deskripsi</label>
                <textarea className="form-control" rows="2" value={formData.description} onChange={(e) => handleFormChange("description", e.target.value)} placeholder="Detil pengeluaran"></textarea>
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <label>Upload Bukti (gambar)</label>
                <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} required={currentUserRole === "karyawan"} />
                {previewUrl && <img src={previewUrl} alt="Preview" style={{ width: "100px", marginTop: "8px" }} />}
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <label>Atau URL Bukti (opsional)</label>
                <input type="text" className="form-control" value={formData.receipt_url} onChange={(e) => handleFormChange("receipt_url", e.target.value)} placeholder="https://..." />
              </div>
            </div>

            {/* Penerima (hanya untuk admin) */}
            {currentUserRole !== "karyawan" && (
              <>
                <div className="col-md-12">
                  <div className="form-group">
                    <label>Penerima</label>
                    <select className="form-control" value={recipientType} onChange={(e) => setRecipientType(e.target.value)}>
                      <option value="self">Saya sendiri</option>
                      <option value="staff">Karyawan</option>
                      <option value="other">Lainnya (manual)</option>
                    </select>
                  </div>
                </div>
                {recipientType === "staff" && (
                  <div className="col-md-12">
                    <div className="form-group">
                      <label>Pilih Karyawan</label>
                      <select className="form-control" value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)}>
                        <option value="">-- Pilih --</option>
                        {staffList.map((staff) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {recipientType === "other" && (
                  <div className="col-md-12">
                    <div className="form-group">
                      <label>Nama Penerima (manual)</label>
                      <input type="text" className="form-control" value={manualRecipientName} onChange={(e) => setManualRecipientName(e.target.value)} placeholder="Contoh: Tukang Sayur, Sopir, dll" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="text-end mt-3">
            <button className="btn btn-secondary me-2" onClick={() => setModalVisible(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleAddExpenditure}>Simpan</button>
          </div>
        </div>
      </Modal>

      {/* Modal Edit Pengeluaran */}
      <Modal title="Edit Pengeluaran" open={editModalVisible} onCancel={() => setEditModalVisible(false)} footer={null} width={600}>
        <div className="modal-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Kategori</label>
                <input type="text" className="form-control" value={formData.category} onChange={(e) => handleFormChange("category", e.target.value)} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Jumlah (Rp)</label>
                <InputNumber className="form-control" value={formData.amount} onChange={(val) => handleFormChange("amount", val)} style={{ width: "100%" }} min={0} prefix="Rp" />
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <label>Deskripsi</label>
                <textarea className="form-control" rows="2" value={formData.description} onChange={(e) => handleFormChange("description", e.target.value)}></textarea>
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <label>Ganti Bukti (gambar)</label>
                <input type="file" className="form-control" accept="image/*" onChange={handleEditFileChange} />
                {editPreviewUrl && (
                  <div className="mt-2">
                    <img src={editPreviewUrl} alt="Preview" style={{ width: "100px", height: "auto", border: "1px solid #ddd" }} />
                  </div>
                )}
                {selectedExpenditure?.receipt_url && !editPreviewUrl && (
                  <div className="mt-2">
                    <a href={selectedExpenditure.receipt_url} target="_blank" rel="noopener noreferrer">Lihat bukti lama</a>
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <label>URL Bukti</label>
                <input type="text" className="form-control" value={formData.receipt_url} onChange={(e) => handleFormChange("receipt_url", e.target.value)} />
              </div>
            </div>
          </div>
          <div className="text-end mt-3">
            <button className="btn btn-secondary me-2" onClick={() => setEditModalVisible(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleEditExpenditure}>Update</button>
          </div>
        </div>
      </Modal>

      {/* Modal Audit Log */}
      <Modal title="Riwayat Perubahan" open={auditModalVisible} onCancel={() => setAuditModalVisible(false)} width={800} footer={null}>
        <AntTable
          dataSource={auditLogs}
          columns={[
            { title: "Waktu", dataIndex: "changed_at", render: (val) => moment(val).format("DD/MM/YYYY HH:mm:ss") },
            { title: "Aksi", dataIndex: "action" },
            { title: "Diubah oleh", dataIndex: "changed_by" },
            { title: "Data Lama", dataIndex: "old_data", ellipsis: true },
            { title: "Data Baru", dataIndex: "new_data", ellipsis: true },
          ]}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  );
};

export default ExpenditureList;