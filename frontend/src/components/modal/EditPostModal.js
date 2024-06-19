import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";


import axios from "../../config/axiosConfig";
import { alertActions } from "../../store/alertSlice";

const EditPostModal = ({ onClose, post }) => {
    const username = useSelector((state) => state.auth.userData.username);
    const profileImage = useSelector((state) => state.auth.userData.image);
    const access = useSelector((state) => state.auth.token.access);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [description, setDescription] = useState(post.description);
    const [location, setLocation] = useState(post.location);
    const [ingredients, setIngredients] = useState(post.ingredients);
    const [difficulty, setDifficulty] = useState(post.difficulty);
    const [image, setImage] = useState(null); // New state for the image

    const config = {
        headers: {
            authorization: `Bearer ${access}`,
        },
    };

    const updateHandler = (e) => {
        const formData = new FormData();
        formData.append("description", description);
        formData.append("location", location);
        formData.append("ingredients", ingredients);
        formData.append("difficulty", difficulty);
        if (image) {
            formData.append("image", image); // Append the new image if selected
        }

        axios
            .put(`posts/${post.id}/update/`, formData, config)
            .then((response) => {
                console.log(response.data);
                if (response.data.statusCode === 6000) {
                    navigate(`/${username}/`);
                    dispatch(
                        alertActions.addAlert({
                            message: response.data.message,
                            type: "success",
                        })
                    );
                    onClose();
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <MainWrapper onClick={onClose}>
            <Helmet>
                <title>Edit Post</title>
            </Helmet>
            <ContentWrapper
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <div className="top">
                    <button onClick={onClose}>Cancel</button>
                    <h3>Edit Info</h3>
                    <button className="done" onClick={updateHandler}>
                        Done
                    </button>
                </div>
                <div className="content">
                    <div className="left">
                        <img src={post.images[0].image} alt="" />
                    </div>
                    <div className="right">
                        <div className="">
                            <div className="location-wrapper">
                                <input
                                    type="text"
                                    placeholder="tittle"
                                    defaultValue={location}
                                    onChange={(e) => {
                                        setLocation(e.target.value);
                                    }}
                                />
                            </div>
                            <textarea
                                defaultValue={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                }}
                            ></textarea>
                        </div>
                        {/* Ingredients Input Field */}
                        <div className="ingredients">
                            <textarea
                                placeholder="Ingredients"
                                value={ingredients}
                                onChange={(e) => setIngredients(e.target.value)}
                            />
                        </div>
                        {/* Difficulty Input Field */}
                        <div className="difficulty">
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                        {/* Image Upload Field */}
                        <div className="image-upload">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files[0])}
                            />
                        </div>
                    </div>
                </div>
            </ContentWrapper>
        </MainWrapper>
    );
};

export default EditPostModal;

const MainWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: #8080804e;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 200;
`;

const ContentWrapper = styled.div`
    background: #fff;
    width: 60%;
    border-radius: 10px;

    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    animation: slide-down 200ms cubic-bezier(0.46, -0.06, 0.39, 1.15) forwards;

    @keyframes slide-down {
        from {
            opacity: 0;
            transform: scale(2);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    & > .top {
        padding: 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #8080804e;

        * {
            font-size: 16px;
        }
        h3 {
            font-weight: 600;
        }
        button {
            cursor: pointer;
            &.done {
                font-weight: 600;
                color: #0095f6;
            }
        }
    }
    .content {
        display: flex;
        height: 500px;
        overflow: hidden;
        .left {
            width: 65%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #8080804e;
            img {
                max-width: 100%;
                max-height: 500px;
            }
        }
        .right {
            width: 35%;
            display: flex;
            justify-content: space-between;
            flex-direction: column;
            }
            textarea {
                padding: 20px;
                font-size: 18px;
                width: 100%;
                height: 100px;
            }
            .location-wrapper {
                bottom: 0;
                display: flex;
                align-items: center;
                border-top: 1px solid #8080804e;
                input {
                    font-size: 18px;
                    padding: 20px;
                    width: 90%;
                }
            }
            .ingredients {
                padding: 0 20px 20px;
        
                textarea {
                    width: 100%;
                    min-height: 100px;
                    font-size: 17px;
                    border: 1px solid #e0e0e0;
                    padding: 10px;
                    border-radius: 5px;
                    resize: vertical;
                    margin-bottom: 10px;
                }
            .difficulty {
                margin-top: 20px;

                input,
                select {
                    width: 100%;
                    padding: 10px;
                    font-size: 16px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    margin-bottom: 10px;
                }
            }
            .image-upload {
                padding: 0 20px 20px;
                input {
                    width: 100%;
                    padding: 10px;
                    font-size: 16px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }
            }
        }
    }
`;
