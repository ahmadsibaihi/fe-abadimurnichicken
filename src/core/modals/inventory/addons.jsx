import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Table from '../../../core/pagination/datatable'; // diperbaiki
import Swal from 'sweetalert2';
import { Calendar, ChevronUp, Filter, PlusCircle, RotateCcw, Sliders, Zap } from 'feather-icons-react/build/IconComponents'; // StopCircle dihapus
import Select from 'react-select';
import { DatePicker } from 'antd';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ImageWithBasePath from '../../../core/img/imagewithbasebath'; // diperbaiki
import { setToogleHeader } from '../../../core/redux/action'; // diperbaiki
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

const Addons = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  const MySwal = withReactContent(Swal);

  // State data addons
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // State untuk modal Add
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddon, setNewAddon] = useState({ name: '', price: '', is_active: true });
  const [addLoading, setAddLoading] = useState(false);

  // State untuk modal Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Fetch addons
  const fetchAddons = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/addons`);
      setAddons(res.data);
    } catch (err) {
      console.error('Failed to fetch addons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  // Handle delete
  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/addons/${id}`);
        MySwal.fire('Deleted!', 'Addon has been deleted.', 'success');
        fetchAddons();
      } catch (err) {
        MySwal.fire('Error!', 'Failed to delete addon.', 'error');
      }
    }
  };

  // Handle add submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newAddon.name) {
      MySwal.fire('Error', 'Nama addon wajib diisi', 'error');
      return;
    }
    setAddLoading(true);
    try {
      await axios.post(`${BASE_URL}/addons`, {
        name: newAddon.name,
        price: parseFloat(newAddon.price) || 0,
        is_active: newAddon.is_active,
      });
      MySwal.fire('Success', 'Addon berhasil ditambahkan', 'success');
      setNewAddon({ name: '', price: '', is_active: true });
      setShowAddModal(false);
      fetchAddons();
    } catch (err) {
      MySwal.fire('Error', 'Gagal menyimpan addon', 'error');
    } finally {
      setAddLoading(false);
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingAddon?.name) {
      MySwal.fire('Error', 'Nama addon wajib diisi', 'error');
      return;
    }
    setEditLoading(true);
    try {
      await axios.put(`${BASE_URL}/addons/${editingAddon.id}`, {
        name: editingAddon.name,
        price: parseFloat(editingAddon.price) || 0,
        is_active: editingAddon.is_active,
      });
      MySwal.fire('Success', 'Addon berhasil diperbarui', 'success');
      setShowEditModal(false);
      fetchAddons();
    } catch (err) {
      MySwal.fire('Error', 'Gagal memperbarui addon', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // Filter dan sorting
  const filteredAddons = addons.filter(addon => {
    if (filterName && !addon.name.toLowerCase().includes(filterName.toLowerCase())) return false;
    if (filterStatus && filterStatus.value !== 'choose Status') {
      if (filterStatus.value === 'Active' && !addon.is_active) return false;
      if (filterStatus.value === 'InActive' && addon.is_active) return false;
    }
    if (filterDate) {
      const createdDate = new Date(addon.created_at).toDateString();
      const filterDateObj = new Date(filterDate).toDateString();
      if (createdDate !== filterDateObj) return false;
    }
    return true;
  });

  // Kolom tabel
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (price) => `Rp ${price.toLocaleString('id-ID')}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Created On',
      dataIndex: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('id-ID'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      render: (isActive) => (
        <span className={`badge ${isActive ? 'badge-linesuccess' : 'badge-linedanger'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      sorter: (a, b) => a.is_active - b.is_active,
    },
    {
      title: 'Actions',
      dataIndex: 'id',
      render: (id, record) => (
        <div className="action-table-data">
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to="#"
              onClick={() => {
                setEditingAddon(record);
                setShowEditModal(true);
              }}
            >
              <i data-feather="edit" className="feather-edit"></i>
            </Link>
            <Link className="confirm-text p-2" to="#" onClick={() => handleDelete(id)}>
              <i data-feather="trash-2" className="feather-trash-2"></i>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  // Tooltips
  const renderTooltip = (props) => <Tooltip {...props}>Pdf</Tooltip>;
  const renderExcelTooltip = (props) => <Tooltip {...props}>Excel</Tooltip>;
  const renderPrinterTooltip = (props) => <Tooltip {...props}>Printer</Tooltip>;
  const renderRefreshTooltip = (props) => <Tooltip {...props}>Refresh</Tooltip>;
  const renderCollapseTooltip = (props) => <Tooltip {...props}>Collapse</Tooltip>;

  const statusOptions = [
    { value: 'choose Status', label: 'Choose Status' },
    { value: 'Active', label: 'Active' },
    { value: 'InActive', label: 'InActive' },
  ];
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
  ];

  const handleDateChange = (date) => setFilterDate(date);

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Header */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Addons / Toppings</h4>
              <h6>Manage your addons and toppings</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <li>
              <OverlayTrigger placement="top" overlay={renderTooltip}>
                <Link>
                  <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                <Link>
                  <ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderPrinterTooltip}>
                <Link>
                  <i data-feather="printer" className="feather-printer" />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                <Link onClick={fetchAddons}>
                  <RotateCcw />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                <Link
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  id="collapse-header"
                  className={data ? 'active' : ''}
                  onClick={() => dispatch(setToogleHeader(!data))}
                >
                  <ChevronUp />
                </Link>
              </OverlayTrigger>
            </li>
          </ul>
          <div className="page-btn">
            <Link to="#" className="btn btn-added" onClick={() => setShowAddModal(true)}>
              <PlusCircle className="me-2" />
              Add New Addon
            </Link>
          </div>
        </div>

        {/* Tabel */}
        <div className="card table-list-card">
          <div className="card-body">
            <div className="table-top">
              <div className="search-set">
                <div className="search-input">
                  <input
                    type="text"
                    placeholder="Search by name"
                    className="form-control form-control-sm formsearch"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                  />
                  <Link to="#" className="btn btn-searchset">
                    <i data-feather="search" className="feather-search" />
                  </Link>
                </div>
              </div>
              <div className="search-path">
                <Link
                  className={`btn btn-filter ${isFilterVisible ? 'setclose' : ''}`}
                  onClick={() => setIsFilterVisible(!isFilterVisible)}
                >
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
                  placeholder="Newest"
                  onChange={(opt) => {
                    const sorted = [...addons];
                    if (opt.value === 'newest') {
                      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    } else if (opt.value === 'oldest') {
                      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                    }
                    setAddons(sorted);
                  }}
                />
              </div>
            </div>

            {/* Filter panel */}
            <div
              className={`card${isFilterVisible ? ' visible' : ''}`}
              id="filter_inputs"
              style={{ display: isFilterVisible ? 'block' : 'none' }}
            >
              <div className="card-body pb-0">
                <div className="row">
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <Zap className="info-img" />
                      <Select
                        className="select"
                        options={statusOptions}
                        placeholder="Filter by Status"
                        onChange={(opt) => setFilterStatus(opt)}
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <Calendar className="info-img" />
                      <div className="input-groupicon">
                        <DatePicker
                          selected={filterDate}
                          onChange={handleDateChange}
                          type="date"
                          className="filterdatepicker"
                          dateFormat="dd-MM-yyyy"
                          placeholder="Filter by Created Date"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6 col-12 ms-auto">
                    <div className="input-blocks">
                      <button
                        className="btn btn-filters ms-auto"
                        onClick={() => {
                          setFilterName('');
                          setFilterStatus(null);
                          setFilterDate(null);
                          fetchAddons();
                        }}
                      >
                        <i data-feather="refresh-cw" className="feather-refresh-cw" /> Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              {loading ? (
                <div className="text-center">Loading...</div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredAddons.map(addon => ({
                    ...addon,
                    key: addon.id,
                  }))}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add Addon */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Addon</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Addon Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={newAddon.name}
                      onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
                      placeholder="Contoh: Extra Sambal"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newAddon.price}
                      onChange={(e) => setNewAddon({ ...newAddon, price: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="checkboxs d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newAddon.is_active}
                        onChange={(e) => setNewAddon({ ...newAddon, is_active: e.target.checked })}
                      />
                      <span className="checkmarks"></span>
                      Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={addLoading}>
                    {addLoading ? 'Saving...' : 'Save Addon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Addon */}
      {showEditModal && editingAddon && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Addon</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Addon Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingAddon.name}
                      onChange={(e) => setEditingAddon({ ...editingAddon, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editingAddon.price}
                      onChange={(e) => setEditingAddon({ ...editingAddon, price: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="checkboxs d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editingAddon.is_active}
                        onChange={(e) => setEditingAddon({ ...editingAddon, is_active: e.target.checked })}
                      />
                      <span className="checkmarks"></span>
                      Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={editLoading}>
                    {editLoading ? 'Updating...' : 'Update Addon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addons;