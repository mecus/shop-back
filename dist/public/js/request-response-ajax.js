$(document).ready(function () {
    firebase.initializeApp({
        apiKey: "AIzaSyC3PouxaTBLmR1R2YhHKTR9dldzLGhCXwA",
        authDomain: "shop-5e89b.firebaseapp.com",
        databaseURL: "https://shop-5e89b.firebaseio.com",
        projectId: "shop-5e89b",
        storageBucket: "shop-5e89b.appspot.com",
        messagingSenderId: "777977280371"
    });
    getDashboard();
});
const getDashboard = () => {
    const db = firebase.firestore();
    const prodLength = document.getElementById("productLength");
    const deptlist = document.getElementById("deptList");
    const aisle = document.getElementById("aisleList");
    const catlist = document.getElementById("catleList");
    if (prodLength) {
        try {
            $.get("/api/products", (data, status) => {
                prodLength.innerText = `${data.length}`;
            });
        }
        catch (err) {
            console.log(err);
        }
    }
    if (deptlist) {
        try {
            const dept = db.collection("departments").get()
                .then(snap => {
                const data = snap.docs;
                deptlist.innerText = `${data.length}`;
            }).catch(err => {
                console.log(err);
            });
        }
        catch (err) {
            console.log(err);
        }
        try {
            const Aisle = db.collection("aisles").get()
                .then(snapshot => {
                const data = snapshot.docs;
                aisle.innerText = `${data.length}`;
            }).catch(err => {
                console.log(err);
            });
        }
        catch (err) {
            console.log(err);
        }
        try {
            const categ = db.collection("category").get()
                .then(snapshot => {
                const data = snapshot.docs;
                catlist.innerText = `${data.length}`;
            }).catch(err => {
                console.log(err);
            });
        }
        catch (err) {
            console.log(err);
        }
    }
};
const firebaseLogin = (user) => {
    // console.log(user.email);
    const logError = document.getElementById("loginError");
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((user) => {
        console.log(user);
        const data = { uid: user.uid, email: user.email };
        localStorage.setItem("user", user.uid);
        // request to tte server with set header
        try {
            $.post("/login", data, (res, status) => {
                console.log(res);
                console.log(status);
                location.replace("/dashboard");
            });
        }
        catch (err) {
            console.log(err);
        }
    })
        .catch((err) => {
        console.log(err);
        logError.innerText = `${err.message}`;
        const loader = document.getElementById("pageLoad");
        setTimeout(() => {
            loader.style.display = "none";
        }, 500);
    });
};
const firebaseSignOut = () => {
    firebase.auth().signOut()
        .then(() => {
        // Sign-out successful.
        localStorage.removeItem("user");
        console.log("Firebase Client Successfully Logged out...");
        $.get("/logout", (status) => {
            console.log(status);
            location.replace("/");
        });
    }).catch((error) => {
        // An error happened.
        console.log(error);
    });
};
const deleteUser = (uid) => {
    const confirmation = confirm("Are you sure ?");
    if (confirmation) {
        $.get("/deleteuser/" + uid, (status) => {
            if (status.error) {
                return alert(status.error);
            }
            console.log(status);
            location.replace("/users");
        });
    }
};
const editUser = (id) => {
    console.log(id);
};
//# sourceMappingURL=request-response-ajax.js.map