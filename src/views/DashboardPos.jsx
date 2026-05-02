import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Coffee, Tag, Package, ShoppingCart } from 'react-feather'; // Pakai feather icon bawaan template

const PosAbi = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Nembak API Go kamu
    axios.get('http://localhost:3000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => alert("Cek Backend Go! Error: " + err));
  }, []);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Abi POS - Dashboard ☕</h2>
        <span className="badge bg-primary fs-6">Backend: Connected</span>
      </div>

      <div className="row">
        {products.map((p) => (
          <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={p.id}>
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <div className="bg-light-primary p-2 rounded">
                    <Coffee size={24} className="text-primary" />
                  </div>
                  <span className="text-muted">ID: {p.id}</span>
                </div>
                <h5 className="card-title fw-bold text-dark">{p.name}</h5>
                <hr className="text-light" />
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-0 small"><Tag size={12}/> Harga</p>
                    <h6 className="fw-bold mb-0">Rp {p.price.toLocaleString()}</h6>
                  </div>
                  <div className="text-end">
                    <p className="text-muted mb-0 small"><Package size={12}/> Stok</p>
                    <h6 className="fw-bold mb-0 text-success">{p.stock}</h6>
                  </div>
                </div>
                <button className="btn btn-primary w-100 mt-3 d-flex align-items-center justify-content-center gap-2">
                  <ShoppingCart size={16} /> Pilih Menu
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PosAbi;