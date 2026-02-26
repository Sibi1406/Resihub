import React from "react";

export default function Payments() {

  const payments = [
    { month: "March 2024", amount: 3500, status: "Paid" },
    { month: "April 2024", amount: 3500, status: "Unpaid" },
    { month: "May 2024", amount: 3500, status: "Paid" },
  ];

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Payments</h2>
        <p style={styles.subtitle}>Maintenance payment history</p>
      </div>


      {/* Summary Cards */}
      <div style={styles.summary}>

        <div style={styles.card}>
          <div>Total Due</div>
          <h3 style={{color:"#e53935"}}>₹3500</h3>
        </div>

        <div style={styles.card}>
          <div>Total Paid</div>
          <h3 style={{color:"#43a047"}}>₹7000</h3>
        </div>

        <div style={styles.card}>
          <div>Status</div>
          <h3 style={{color:"#f5c518"}}>Active</h3>
        </div>

      </div>


      {/* Payment Table */}
      <div style={styles.tableBox}>

        <table style={styles.table}>

          <thead>
            <tr>
              <th>Month</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Invoice</th>
            </tr>
          </thead>

          <tbody>

            {payments.map((pay, index) => (
              <tr key={index}>

                <td>{pay.month}</td>

                <td>₹{pay.amount}</td>

                <td>
                  <span style={
                    pay.status === "Paid"
                    ? styles.paid
                    : styles.unpaid
                  }>
                    {pay.status}
                  </span>
                </td>

                <td>
                  <button style={styles.btn}>
                    Download
                  </button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}



/* ================= STYLES ================= */

const styles = {

container:{
padding:"25px",
background:"#f9f6ef",
minHeight:"100vh"
},

header:{
marginBottom:"20px"
},

title:{
fontSize:"28px",
fontWeight:"bold"
},

subtitle:{
color:"#777"
},

summary:{
display:"flex",
gap:"20px",
marginBottom:"25px"
},

card:{
flex:1,
background:"#fff",
padding:"20px",
borderRadius:"12px",
boxShadow:"0 5px 15px rgba(0,0,0,0.05)"
},

tableBox:{
background:"#fff",
padding:"20px",
borderRadius:"12px",
boxShadow:"0 5px 15px rgba(0,0,0,0.05)"
},

table:{
width:"100%",
borderCollapse:"collapse"
},

paid:{
background:"#e8f5e9",
color:"#2e7d32",
padding:"5px 10px",
borderRadius:"8px"
},

unpaid:{
background:"#ffebee",
color:"#c62828",
padding:"5px 10px",
borderRadius:"8px"
},

btn:{
background:"#f5c518",
border:"none",
padding:"8px 15px",
borderRadius:"8px",
cursor:"pointer",
fontWeight:"bold"
}

};