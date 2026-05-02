import React, { useState, useEffect } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../core/img/imagewithbasebath';
import { ChevronUp, RotateCcw } from 'feather-icons-react/build/IconComponents';
import { setToogleHeader } from '../../../core/redux/action';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, PlusCircle, Sliders, StopCircle, User } from 'react-feather';
import Select from 'react-select';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Table from '../../../core/pagination/datatable';
import { Modal, Form, Button, Badge } from 'antd';
import API from '../../../api/api';

const UserManagement = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.toggle_header);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'karyawan',
        is_active: true
    });

    const MySwal = withReactContent(Swal);
    const currentUserRole = localStorage.getItem('userRole') || 'karyawan';

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await API.get('/v1/users');
            setUsers(res.data);
        } catch (error) {
            console.error(error);
            MySwal.fire('Error', 'Gagal memuat data user', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = (id) => {
        MySwal.fire({
            title: 'Yakin hapus?',
            text: 'User akan dihapus permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await API.delete(`/v1/users/${id}`);
                    MySwal.fire('Terhapus!', 'User berhasil dihapus.', 'success');
                    fetchUsers();
                } catch (err) {
                    MySwal.fire('Error', err.response?.data?.error || 'Gagal hapus user', 'error');
                }
            }
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingUser) {
                await API.put(`/v1/users/${editingUser.id}`, {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    is_active: formData.is_active
                });
                MySwal.fire('Sukses', 'User berhasil diupdate', 'success');
            } else {
                await API.post('/v1/users', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                });
                MySwal.fire('Sukses', 'User berhasil ditambahkan', 'success');
            }
            setModalVisible(false);
            resetForm();
            fetchUsers();
        } catch (err) {
            MySwal.fire('Error', err.response?.data?.error || 'Operasi gagal', 'error');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', role: 'karyawan', is_active: true });
        setEditingUser(null);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            password: ''
        });
        setModalVisible(true);
    };

    const columns = [
        {
            title: "User Name",
            dataIndex: "name",
            render: (text) => (
                <span className="userimgname">
                    <Link to="#" className="userslist-img bg-img">
                        <ImageWithBasePath alt="" src="assets/img/profiles/avatar-01.jpg" />
                    </Link>
                    <div>
                        <Link to="#">{text}</Link>
                    </div>
                </span>
            ),
            sorter: (a, b) => a.name.length - b.name.length
        },
        {
            title: "Email",
            dataIndex: "email",
            sorter: (a, b) => a.email.length - b.email.length
        },
        {
            title: "Role",
            dataIndex: "role",
            render: (role) => (
                <Badge color={role === 'superadmin' ? 'gold' : role === 'admin' ? 'blue' : 'green'}>
                    {role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Karyawan'}
                </Badge>
            ),
            sorter: (a, b) => a.role.length - b.role.length
        },
        {
            title: "Status",
            dataIndex: "is_active",
            render: (active) => (
                <span className={`badge ${active ? 'badge-linesuccess' : 'badge-linedanger'}`}>
                    {active ? 'Active' : 'Inactive'}
                </span>
            ),
            sorter: (a, b) => a.is_active - b.is_active
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record) => (
                <div className="action-table-data">
                    <div className="edit-delete-action">
                        <Link className="me-2 p-2" to="#" onClick={() => openEditModal(record)}>
                            <i data-feather="edit" className="feather-edit"></i>
                        </Link>
                        <Link className="confirm-text p-2" to="#" onClick={() => handleDelete(record.id)}>
                            <i data-feather="trash-2" className="feather-trash-2"></i>
                        </Link>
                    </div>
                </div>
            )
        }
    ];

    const roleOptions = [
        { value: 'karyawan', label: 'Karyawan' },
        { value: 'admin', label: 'Admin' },
        ...(currentUserRole === 'superadmin' ? [{ value: 'superadmin', label: 'Super Admin' }] : [])
    ];

    const toggleFilterVisibility = () => setIsFilterVisible(prev => !prev);

    return (
        <div>
            <div className="page-wrapper">
                <div className="content">
                    <div className="page-header">
                        <div className="add-item d-flex">
                            <div className="page-title">
                                <h4>User List</h4>
                                <h6>Manage Your Users</h6>
                            </div>
                        </div>
                        <ul className="table-top-head">
                            <li><OverlayTrigger placement="top" overlay={<Tooltip>Pdf</Tooltip>}><Link><ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" /></Link></OverlayTrigger></li>
                            <li><OverlayTrigger placement="top" overlay={<Tooltip>Excel</Tooltip>}><Link><ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" /></Link></OverlayTrigger></li>
                            <li><OverlayTrigger placement="top" overlay={<Tooltip>Printer</Tooltip>}><Link><i data-feather="printer" className="feather-printer" /></Link></OverlayTrigger></li>
                            <li><OverlayTrigger placement="top" overlay={<Tooltip>Refresh</Tooltip>}><Link onClick={fetchUsers}><RotateCcw /></Link></OverlayTrigger></li>
                            <li><OverlayTrigger placement="top" overlay={<Tooltip>Collapse</Tooltip>}>
                                <Link id="collapse-header" className={data ? "active" : ""} onClick={() => dispatch(setToogleHeader(!data))}>
                                    <ChevronUp />
                                </Link>
                            </OverlayTrigger></li>
                        </ul>
                        <div className="page-btn">
                            <Link to="#" className="btn btn-added" onClick={() => { resetForm(); setModalVisible(true); }}>
                                <PlusCircle className="me-2" /> Add New User
                            </Link>
                        </div>
                    </div>

                    <div className="card table-list-card">
                        <div className="card-body">
                            <div className="table-top">
                                <div className="search-set">
                                    <div className="search-input">
                                        <input type="text" placeholder="Search" className="form-control form-control-sm formsearch" />
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
                                    <Select className="select" options={[{ value: 'newest', label: 'Newest' }]} placeholder="Newest" />
                                </div>
                            </div>
                            <div className={`card${isFilterVisible ? ' visible' : ''}`} id="filter_inputs" style={{ display: isFilterVisible ? 'block' : 'none' }}>
                                <div className="card-body pb-0">
                                    <div className="row">
                                        <div className="col-lg-3 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <User className="info-img" />
                                                <Select options={roleOptions} placeholder="Choose Role" />
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6 col-12">
                                            <div className="input-blocks">
                                                <StopCircle className="info-img" />
                                                <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} placeholder="Choose Status" />
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-sm-6 col-12 ms-auto">
                                            <div className="input-blocks">
                                                <Link className="btn btn-filters ms-auto"><i data-feather="search" className="feather-search" /> Search</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <Table columns={columns} dataSource={users} loading={loading} rowKey="id" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal title={editingUser ? "Edit User" : "Add New User"} open={modalVisible} onCancel={() => { setModalVisible(false); resetForm(); }} footer={null} width={500}>
                <Form layout="vertical" onFinish={handleSubmit}>
                    <Form.Item label="Name" required>
                        <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </Form.Item>
                    <Form.Item label="Email" required>
                        <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </Form.Item>
                    {!editingUser && (
                        <Form.Item label="Password" required>
                            <input type="password" className="form-control" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        </Form.Item>
                    )}
                    <Form.Item label="Role">
                        <select className="form-control" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                            <option value="karyawan">Karyawan</option>
                            <option value="admin">Admin</option>
                            {currentUserRole === 'superadmin' && <option value="superadmin">Super Admin</option>}
                        </select>
                    </Form.Item>
                    {editingUser && (
                        <Form.Item label="Status">
                            <select className="form-control" value={formData.is_active ? 'true' : 'false'} onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </Form.Item>
                    )}
                    <div className="text-end">
                        <Button onClick={() => setModalVisible(false)} style={{ marginRight: 8 }}>Cancel</Button>
                        <Button type="primary" htmlType="submit">Save</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;