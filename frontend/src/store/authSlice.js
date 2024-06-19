import { createSlice } from "@reduxjs/toolkit";
import jwt_decode from "jwt-decode";

const getParsedLocalStorageItem = (key) => {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error parsing JSON for key "${key}":`, error);
        return null;
    }
};

const initialState = {
    socialData: getParsedLocalStorageItem("socialData"),
    authData: getParsedLocalStorageItem("authData"),
    token: getParsedLocalStorageItem("token"),
    isAuthenticated:
        localStorage.getItem("token") || localStorage.getItem("socialData")
            ? true
            : false,
    userData: getParsedLocalStorageItem("userData"),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        googleLogin(state, action) {
            state.socialData = action.payload.authData;
            state.isAuthenticated = true;
            state.userData = action.payload.profileData;
            localStorage.setItem(
                "socialData",
                JSON.stringify(state.socialData)
            );
            localStorage.setItem(
                "userData",
                JSON.stringify(action.payload.profileData)
            );
        },
        loginUser(state, action) {
            const data = jwt_decode(action.payload.token.access);
            state.authData = data;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.userData = action.payload.profileData;
            localStorage.setItem("authData", JSON.stringify(data));
            localStorage.setItem("token", JSON.stringify(action.payload.token));
            localStorage.setItem(
                "userData",
                JSON.stringify(action.payload.profileData)
            );
        },
        logout(state) {
            localStorage.clear();
            state.isAuthenticated = false;
            state.socialData = null;
            state.authData = null;
            state.token = null;
            state.userData = null;
        },
        updateAccess(state, action) {
            state.token.access = action.payload.access;
            const token = getParsedLocalStorageItem("token");
            if (token) {
                token.access = action.payload.access;
                localStorage.setItem("token", JSON.stringify(token));
            }
        },
        updateUserData(state, { payload }) {
            state.userData = {};
            localStorage.setItem("userData", JSON.stringify(payload.userData));
            state.userData = payload.userData;
        },
    },
});

export const authActions = authSlice.actions;

export default authSlice.reducer;
