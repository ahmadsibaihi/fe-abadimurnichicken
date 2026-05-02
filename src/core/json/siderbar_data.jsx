import React from 'react';
import * as Icon from 'react-feather';

export const SidebarData = [
    // --- GROUP KEUANGAN (hanya Dashboard & Pengeluaran) ---
    {
        label: "Keuangan",
        submenuOpen: true,
        showSubRoute: false,
        submenuHdr: "Keuangan",
        submenuItems: [
            { label: "Dashboard", link: "/", icon: <Icon.Grid />, showSubRoute: false, submenu: false },
            { label: "Pengeluaran", link: "/expenditures", icon: <Icon.DollarSign />, showSubRoute: false, submenu: false },
        ]
    },
    // --- GROUP MANAJEMEN USER (khusus admin/superadmin) ---
    {
        label: "Manajemen User",
        submenuOpen: true,
        showSubRoute: false,
        submenuHdr: "User",
        submenuItems: [
            { label: "User Management", link: "/pengguna", icon: <Icon.Users />, showSubRoute: false, submenu: false },
        ]
    },
    // // --- GROUP 1: MAIN OPERATIONAL (DIKOMMENTAR) ---
    // {
    //     label: "Main",
    //     submenuOpen: true,
    //     showSubRoute: false,
    //     submenuHdr: "Main",
    //     submenuItems: [
    //         { label: "Dashboard", link: "/", icon: <Icon.Grid />, showSubRoute: false, submenu: false },
    //         { label: "POS (Kasir)", link: "/pos", icon: <Icon.Monitor />, showSubRoute: false, submenu: false },
    //         { label: "Riwayat Pesanan", link: "/sales-list", icon: <Icon.Clipboard />, showSubRoute: false, submenu: false },
    //     ]
    // },
    // // --- GROUP 2: KATALOG MENU (DIKOMMENTAR) ---
    // {
    //     label: "Katalog Menu",
    //     submenuOpen: true,
    //     showSubRoute: false,
    //     submenuHdr: "Katalog Menu",
    //     submenuItems: [
    //         {
    //             label: "Produk",
    //             icon: <Icon.Package />,
    //             submenu: true,
    //             showSubRoute: false,
    //             submenuItems: [
    //                 { label: "Daftar Produk", link: "/product-list" },
    //                 { label: "Tambah Produk", link: "/add-product" },
    //                 { label: "Barcode / QR", link: "/barcode" },
    //             ]
    //         },
    //         { label: "Kategori", link: "/category-list", icon: <Icon.Layers />, showSubRoute: false, submenu: false },
    //         { label: "Tambahan (Add-ons)", link: "/addons", icon: <Icon.PlusCircle />, showSubRoute: false, submenu: false },
    //         { label: "Menu Paket (Combo)", link: "/combo-packages", icon: <Icon.Archive />, showSubRoute: false, submenu: false },
    //     ]
    // },
    // // --- GROUP 3: PENGATURAN RESTO (DIKOMMENTAR) ---
    // {
    //     label: "Pengaturan Resto",
    //     submenuOpen: true,
    //     showSubRoute: false,
    //     submenuHdr: "Pengaturan Resto",
    //     submenuItems: [
    //         { label: "Level Pedas", link: "/spicy-levels", icon: <Icon.Zap />, showSubRoute: false, submenu: false },
    //         { label: "Slot Waktu Menu", link: "/time-slots", icon: <Icon.Clock />, showSubRoute: false, submenu: false },
    //     ]
    // },
    // // --- GROUP 4: REPORTS (DIKOMMENTAR) ---
    // {
    //     label: "Laporan",
    //     submenuOpen: true,
    //     showSubRoute: false,
    //     submenuHdr: "Reports",
    //     submenuItems: [
    //         { label: "Laporan Penjualan", link: "/sales-report", icon: <Icon.BarChart2 />, showSubRoute: false },
    //         { label: "Laporan Stok", link: "/inventory-report", icon: <Icon.Inbox />, showSubRoute: false },
    //         { label: "Pengeluaran", link: "/expenditures", icon: <Icon.DollarSign />, showSubRoute: false }
    //     ],
    // },
];