import React, { useState, useEffect, useCallback } from "react";
import { DatePicker, Card, Row, Col, Statistic, Spin, message } from "antd";
import Chart from "react-apexcharts";
import moment from "moment";
import API from "../../api/api";

const { RangePicker } = DatePicker;

const ExpenseDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [totalExpenseToday, setTotalExpenseToday] = useState(0);
  const [totalExpensePeriod, setTotalExpensePeriod] = useState(0);
  const [avgExpensePerDay, setAvgExpensePerDay] = useState(0);
  const [dailyData, setDailyData] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [dateRange, setDateRange] = useState([moment().startOf("month"), moment().endOf("month")]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Total pengeluaran hari ini (approved)
      const today = moment().format("YYYY-MM-DD");
      const todayRes = await API.get(`/v1/expenditures/daily-summary?date=${today}`);
      setTotalExpenseToday(todayRes.data.total_expense || 0);

      // 2. Ambil semua pengeluaran approved (batas 2000 data, cukup untuk sebulan)
      const allRes = await API.get("/v1/expenditures?status=approved&limit=2000");
      const allExpenses = allRes.data || [];

      // Filter berdasarkan rentang tanggal yang dipilih
      const filtered = allExpenses.filter(exp => {
        const expDate = moment(exp.date);
        return expDate.isBetween(dateRange[0], dateRange[1], "day", "[]");
      });

      const total = filtered.reduce((sum, item) => sum + item.amount, 0);
      setTotalExpensePeriod(total);
      const daysDiff = dateRange[1].diff(dateRange[0], "days") + 1;
      setAvgExpensePerDay(daysDiff > 0 ? total / daysDiff : 0);

      // Group by date untuk grafik
      const grouped = filtered.reduce((acc, exp) => {
        const d = moment(exp.date).format("YYYY-MM-DD");
        if (!acc[d]) acc[d] = 0;
        acc[d] += exp.amount;
        return acc;
      }, {});
      const sortedDates = Object.keys(grouped).sort();
      const chartData = sortedDates.map(d => ({
        date: d,
        amount: grouped[d],
      }));
      setDailyData(chartData);

      // 3. Ambil 5 pengeluaran terbaru (berdasarkan created_at)
      const sortedRecent = [...allExpenses]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentExpenses(sortedRecent);
    } catch (error) {
      console.error(error);
      message.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Konfigurasi grafik ApexCharts
  const chartOptions = {
    chart: { type: "line", height: 350, toolbar: { show: true } },
    xaxis: { categories: dailyData.map(d => d.date), title: { text: "Tanggal" } },
    yaxis: { title: { text: "Jumlah (Rp)" }, labels: { formatter: (val) => `Rp ${val.toLocaleString()}` } },
    title: { text: "Tren Pengeluaran", align: "center" },
    stroke: { curve: "smooth", width: 3 },
    markers: { size: 4 },
    tooltip: { y: { formatter: (val) => `Rp ${val.toLocaleString()}` } },
    colors: ["#ff4d4f"],
  };

  const chartSeries = [{ name: "Pengeluaran", data: dailyData.map(d => d.amount) }];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header d-flex justify-content-between align-items-center">
          <h4>Dashboard Pengeluaran</h4>
          <RangePicker value={dateRange} onChange={(dates) => setDateRange(dates)} format="DD/MM/YYYY" />
        </div>
        <Spin spinning={loading}>
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic title="Total Pengeluaran Hari Ini" value={totalExpenseToday} prefix="Rp " valueStyle={{ color: "#cf1322" }} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title={`Total Pengeluaran Periode`} value={totalExpensePeriod} prefix="Rp " valueStyle={{ color: "#cf1322" }} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Rata-rata per Hari" value={avgExpensePerDay} prefix="Rp " precision={0} valueStyle={{ color: "#fa8c16" }} />
              </Card>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={24}>
              <Card title="Tren Pengeluaran">
                <Chart options={chartOptions} series={chartSeries} type="line" height={350} />
              </Card>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col span={24}>
              <Card title="5 Pengeluaran Terbaru">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Kategori</th>
                        <th>Deskripsi</th>
                        <th>Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentExpenses.map(exp => (
                        <tr key={exp.id}>
                          <td>{moment(exp.date).format("DD/MM/YYYY")}</td>
                          <td>{exp.category}</td>
                          <td>{exp.description}</td>
                          <td>Rp {exp.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                      {recentExpenses.length === 0 && (
                        <tr><td colSpan="4" style={{ textAlign: "center" }}>Belum ada data</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>
    </div>
  );
};

export default ExpenseDashboard;