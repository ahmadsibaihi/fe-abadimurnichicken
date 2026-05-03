import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import { all_routes } from "../../../Router/all_routes";
import API from "../../../api/api"; 
import Swal from "sweetalert2";

const Signin = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire("Error", "Email dan password wajib diisi", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await API.post("/auth/login", { email, password });
      const { token, user } = response.data;

      // Simpan token dan user ke localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Set default header untuk semua request axios selanjutnya
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      Swal.fire("Sukses", "Login berhasil", "success").then(() => {
        // Redirect ke dashboard keuangan (atau halaman utama)
        navigate("/dashboard");
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Login gagal, periksa email dan password";
      Swal.fire("Error", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="account-content">
        <div className="login-wrapper bg-img">
          <div className="login-content">
            <form onSubmit={handleSubmit}>
              <div className="login-userset">
                <div className="login-logo logo-normal">
                  <ImageWithBasePath src="assets/img/logoamc.png" alt="img" />
                </div>
                <Link to={route.dashboard} className="login-logo logo-white">
                  <ImageWithBasePath src="assets/img/logo-white.png" alt="logo" />
                </Link>
                <div className="login-userheading">
                  <h3>Masuk</h3>
                  <h4>
                    Masukan email dan password untuk mengakses aMc dashboard.
                  </h4>
                </div>
                <div className="form-login mb-3">
                  <label className="form-label">Email</label>
                  <div className="form-addons">
                    <input
                      type="email"
                      placeholder="Masukkan Email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <ImageWithBasePath src="assets/img/icons/mail.svg" alt="img" />
                  </div>
                </div>
                <div className="form-login mb-3">
                  <label className="form-label">Kata Sandi</label>
                  <div className="pass-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="pass-input form-control"
                      placeholder="Masukkan Kata Sandi"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      className={`fas toggle-password ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>
                <div className="form-login authentication-check">
                  <div className="row">
                    <div className="col-12 d-flex align-items-center justify-content-between">
                      <div className="custom-control custom-checkbox">
                        <label className="checkboxs ps-4 mb-0 pb-0 line-height-1">
                          <input type="checkbox" className="form-control" />
                          <span className="checkmarks" />
                          Remember me
                        </label>
                      </div>
                      {/* <div className="text-end">
                        <Link className="forgot-link" to={route.forgotPassword}>
                          Forgot Password?
                        </Link>
                      </div> */}
                    </div>
                  </div>
                </div>
                <div className="form-login">
                  <button type="submit" className="btn btn-login" disabled={loading}>
                    {loading ? "Loading..." : "Masuk Sekarang"}
                  </button>
                </div>
                {/* <div className="signinform">
                  <h4>
                    New on our platform?
                    <Link to={route.register} className="hover-a">
                      {" "}
                      Create an account
                    </Link>
                  </h4>
                </div> */}
                {/* <div className="form-setlogin or-text">
                  <h4>OR</h4>
                </div>
                <div className="form-sociallink">
                  <ul className="d-flex">
                    <li>
                      <Link to="#" className="facebook-logo">
                        <ImageWithBasePath src="assets/img/icons/facebook-logo.svg" alt="Facebook" />
                      </Link>
                    </li>
                    <li>
                      <Link to="#">
                        <ImageWithBasePath src="assets/img/icons/google.png" alt="Google" />
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="apple-logo">
                        <ImageWithBasePath src="assets/img/icons/apple-logo.svg" alt="Apple" />
                      </Link>
                    </li>
                  </ul>
                  <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
                    <p>Copyright © 2023 DreamsPOS. All rights reserved</p>
                  </div>
                </div> */}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;