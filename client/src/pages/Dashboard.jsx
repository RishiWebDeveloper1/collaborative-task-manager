const Dashboard = () => {
    return (
        <>
            <h1>Click Here to logout</h1>
            <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}>
                Logout
            </button>
        </>
    );
};

export default Dashboard;
