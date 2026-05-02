import React, { useState, useEffect } from "react";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/api";
import Swal from "sweetalert2";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    avatar: "assets/img/profiles/avator1.jpg",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ambil data user dari localStorage saat komponen dimuat
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setFormData((prev) => ({
          ...prev,
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
        }));
        if (userData.avatar) {
          setAvatarPreview(userData.avatar);
        }
      } catch (error) {
        console.error("Failed to parse user data", error);
      }
    } else {
      // Tidak ada user, redirect ke login
      navigate("/signin");
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasi password
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      Swal.fire("Error", "Password baru dan konfirmasi tidak cocok", "error");
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      if (formData.current_password) {
        formDataToSend.append("current_password", formData.current_password);
        formDataToSend.append("new_password", formData.new_password);
      }
      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile);
      }

      const response = await API.put("/v1/profile", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update localStorage dengan data terbaru
      const updatedUser = response.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      Swal.fire("Sukses", "Profil berhasil diperbarui", "success");
      // Reset field password
      setFormData((prev) => ({
        ...prev,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Gagal update profil";
      Swal.fire("Error", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <h4>Profile</h4>
            <h6>User Profile</h6>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="profile-set">
              <div className="profile-head"></div>
              <div className="profile-top">
                <div className="profile-content">
                  <div className="profile-contentimg">
                    <img
                      src={avatarPreview || user.avatar || "assets/img/profiles/avator1.jpg"}
                      alt="Avatar"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                    <div className="profileupload">
                      <input
                        type="file"
                        id="imgInp"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: "none" }}
                      />
                      <label htmlFor="imgInp" style={{ cursor: "pointer" }}>
                        <ImageWithBasePath src="assets/img/icons/edit-set.svg" alt="Edit" />
                      </label>
                    </div>
                  </div>
                  <div className="profile-contentname">
                    <h2>{formData.name || user.name}</h2>
                    <h4>Updates Your Photo and Personal Details.</h4>
                  </div>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-lg-6 col-sm-12">
                  <div className="input-blocks">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-sm-12">
                  <div className="input-blocks">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-sm-12">
                  <div className="input-blocks">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-sm-12">
                  <div className="input-blocks">
                    <label className="form-label">Role</label>
                    <input
                      type="text"
                      className="form-control"
                      value={
                        user.role === "superadmin"
                          ? "Super Admin"
                          : user.role === "admin"
                          ? "Admin"
                          : "Cashier"
                      }
                      disabled
                    />
                  </div>
                </div>

                <div className="col-12">
                  <hr />
                  <h5>Change Password</h5>
                </div>
                <div className="col-lg-4 col-sm-12">
                  <div className="input-blocks">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="current_password"
                      value={formData.current_password}
                      onChange={handleInputChange}
                      placeholder="Leave blank if not changing"
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-sm-12">
                  <div className="input-blocks">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="col-lg-4 col-sm-12">
                  <div className="input-blocks">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <button type="submit" className="btn btn-submit me-2" disabled={loading}>
                    {loading ? "Saving..." : "Submit"}
                  </button>
                  <Link to="#" className="btn btn-cancel" onClick={() => navigate("/dashboard")}>
                    Cancel
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;