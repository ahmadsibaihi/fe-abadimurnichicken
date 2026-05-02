import React, { useState, useRef } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const BASE_URL = "http://localhost:3000/api/v1";

const AddCategoryList = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef(null); // ref untuk elemen modal

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
    setError("");
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({ ...prev, is_active: e.target.checked }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Fungsi untuk menutup modal secara aman
  const closeModal = () => {
    const modalElement = modalRef.current;
    if (modalElement) {
      // Coba gunakan Bootstrap API jika ada
      if (window.bootstrap && window.bootstrap.Modal) {
        const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();
      }
      // Fallback: cari tombol close dan klik
      const closeButton = modalElement.querySelector('.btn-close');
      if (closeButton) closeButton.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        slug: generateSlug(formData.name),
        icon: "",
        sort_order: 0,
        is_active: formData.is_active,
      };

      const response = await axios.post(`${BASE_URL}/categories`, payload);

      if (response.status === 201 || response.status === 200) {
        if (onSuccess) await onSuccess();
        closeModal(); // tutup modal dengan aman
        setFormData({ name: "", is_active: true });
      } else {
        throw new Error("Respons tidak sesuai");
      }
    } catch (err) {
      console.error("Create category error:", err);
      let msg = "Gagal membuat kategori. ";
      if (err.response?.data?.message) msg += err.response.data.message;
      else if (err.message) msg += err.message;
      else msg += "Periksa koneksi atau inputan.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade"
      id="add-category"
      tabIndex="-1"
      aria-hidden="true"
      ref={modalRef}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Tambah Kategori Baru</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Nama Kategori *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Makanan, Minuman, Ayam Goreng, dll."
                />
              </div>
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="status-switch"
                    checked={formData.is_active}
                    onChange={handleStatusChange}
                  />
                  <label className="form-check-label" htmlFor="status-switch">
                    Status Aktif
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                disabled={loading}
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Kategori"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

AddCategoryList.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};

export default AddCategoryList;