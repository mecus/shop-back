
const formHolder = document.getElementById("form-holder");
const card = document.getElementById("card");
const progress = document.getElementById("show-progress");
const loader = document.getElementById("pageLoad");
const addForm = () => {
    formHolder.style.display = "block";
    setTimeout(() => {
        card.style.marginTop = "100px";
        card.style.transition = ".4s";
    }, 100);
};
const removeForm = () => {
    card.style.marginTop = "-100%";
    card.style.transition = "1s";
    setTimeout(() => {
        formHolder.style.display = "none";
        formHolder.style.transition = "2s";
    }, 200);
};
const showProgress = () => {
    progress.style.display = "block";
};
const spinner = () => {
    loader.style.display = "block";
};
const goBack = () => {
    window.history.back();
    return 0;
};
