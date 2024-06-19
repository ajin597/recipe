import React, { useState, useRef } from "react";
import styled from "styled-components";
import { Helmet } from "react-helmet";
import axios from "../../config/axiosConfig";
import imagesIcon from "../../assets/icons/images.svg";
import arrow from "../../assets/icons/arrow.svg";
import { useDispatch, useSelector } from "react-redux";
import { postActions } from "../../store/postSlice";
import { useNavigate } from "react-router-dom";

const CreatePost = ({ onClose }) => {
    // Local states
    const [isSelected, setIsSelected] = useState(false);
    const [showNextBtn, setShowNextBtn] = useState(false);
    const [postImages, setPostImages] = useState([]);
    const [ingredients, setIngredients] = useState([""]);
    const [difficulty, setDifficulty] = useState("Easy");
    const [steps, setSteps] = useState([{ text: "", image: null }]);

    const captionRef = useRef();
    const locationRef = useRef();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Global states
    const access = useSelector((state) => state.auth.token.access);
    const userData = useSelector((state) => state.auth.userData);

    const config = {
        headers: {
            authorization: `Bearer ${access}`,
        },
    };

    const uploadHandler = () => {
        const formData = new FormData();
        formData.append("description", captionRef.current.value);
        formData.append("location", locationRef.current.value);
        formData.append("ingredients", JSON.stringify(ingredients));
        formData.append("difficulty", difficulty);
        formData.append("steps", JSON.stringify(steps.map(step => step.text)));

        steps.forEach((step, index) => {
            if (step.image) {
                formData.append(`stepImages`, step.image);
            }
        });

        postImages.forEach((image) => {
            formData.append(`images`, image);
        });

        axios
            .post("posts/create-new/", formData, config)
            .then((res) => {
                if (res.data.statusCode === 6000) {
                    dispatch(postActions.addToPost(res.data.data));
                    onClose();
                    navigate('/');
                }
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setPostImages(files);
        setShowNextBtn(files.length > 0);
    };

    const handleStepImageChange = (index, e) => {
        const newSteps = [...steps];
        newSteps[index].image = e.target.files[0];
        setSteps(newSteps);
    };

    const handleIngredientChange = (index, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = value;
        setIngredients(newIngredients);
    };

    const addIngredient = () => {
        setIngredients([...ingredients, ""]);
    };

    const removeIngredient = (index) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const handleStepChange = (index, value) => {
        const newSteps = [...steps];
        newSteps[index].text = value;
        setSteps(newSteps);
    };

    const addStep = () => {
        setSteps([...steps, { text: "", image: null }]);
    };

    const removeStep = (index) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    return (
        <>
            <Helmet>
                <title>Create Post</title>
            </Helmet>
            <MainWrapper onClick={onClose}>
                <ContentWrapper onClick={(e) => e.stopPropagation()}>
                    <div className={`top ${isSelected && "selected"}`}>
                        {isSelected && (
                            <img
                                src={arrow}
                                alt="back"
                                onClick={() => setIsSelected(false)}
                            />
                        )}
                        <h3>Create New Post</h3>
                        {isSelected && (
                            <h3 className="share" onClick={uploadHandler}>
                                Share
                            </h3>
                        )}
                    </div>
                    {!isSelected ? (
                        <div className="content">
                            <img src={imagesIcon} alt="upload icon" />
                            <h3>Upload images to create a new post</h3>
                            <label htmlFor="upload">Select from your device</label>
                            <form action="" encType="multipart/form-data">
                                <input
                                    type="file"
                                    id="upload"
                                    onChange={handleImageChange}
                                    multiple
                                    hidden
                                />
                            </form>
                            {showNextBtn && (
                                <button onClick={() => setIsSelected(true)}>Next</button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="caption">
                                <textarea
                                    placeholder="Write a caption..."
                                    ref={captionRef}
                                ></textarea>
                                <div className="location-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Location"
                                        ref={locationRef}
                                    />
                                </div>
                            </div>
                            <div className="ingredients">
                                <h4>Ingredients</h4>
                                {ingredients.map((ingredient, index) => (
                                    <div key={index} className="ingredient">
                                        <textarea
                                            value={ingredient}
                                            onChange={(e) => handleIngredientChange(index, e.target.value)}
                                            placeholder={`Ingredient ${index + 1}`}
                                        />
                                        <button type="button" onClick={() => removeIngredient(index)}>Remove</button>
                                    </div>
                                ))}
                                <button type="button" onClick={addIngredient}>Add Ingredient</button>
                            </div>
                            <div className="steps">
                                <h4>Steps</h4>
                                {steps.map((step, index) => (
                                    <div key={index} className="step">
                                        <textarea
                                            value={step.text}
                                            onChange={(e) => handleStepChange(index, e.target.value)}
                                            placeholder={`Step ${index + 1}`}
                                        />
                                        <input
                                            type="file"
                                            onChange={(e) => handleStepImageChange(index, e)}
                                            accept="image/*"
                                        />
                                        {step.image && (
                                            <img
                                                src={URL.createObjectURL(step.image)}
                                                alt={`Step ${index + 1}`}
                                                className="step-image-preview"
                                            />
                                        )}
                                        <button type="button" onClick={() => removeStep(index)}>Remove</button>
                                    </div>
                                ))}
                                <button type="button" onClick={addStep}>Add Step</button>
                            </div>
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
                        </>
                    )}
                </ContentWrapper>
            </MainWrapper>
        </>
    );
};

export default CreatePost;

const MainWrapper = styled.div`
    position: fixed;
    z-index: 30;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.6);
    padding: 20px;
`;

const ContentWrapper = styled.div`
    width: 40%;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    font-family: 'Arial, sans-serif';

    .top {
        width: 100%;
        display: flex;
        justify-content: center;
        padding: 15px;
        border-bottom: 1px solid #e0e0e0;

        &.selected {
            justify-content: space-between;

            .share,
            img {
                color: #037dcf;
                cursor: pointer;
            }
        }

        h3 {
            font-weight: 600;
            font-size: 18px;
            color: #4f4f4f;
        }
    }

    .content {
        width: 100%;
        display: flex;
        align-items: center;
        flex-direction: column;
        padding-top: 50px;

        img {
            width: 50px;
        }

        h3 {
            margin: 15px 0;
            font-weight: 100;
            color: #808080;
        }

        label {
            background-color: #0095f6;
            color: white;
            padding: 10px 20px;
            font-size: 16px;
            font-weight: 600;
            font-family: sans-serif;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 1rem;
            margin-bottom: 50px;
        }

        button {
            margin: 0 20px 20px auto;
            font-size: 15px;
            font-weight: 600;
            color: #037dcf;
            cursor: pointer;
            background: none;
            border: none;
        }
    }

    .user-details {
        display: flex;
        align-items: center;
        padding: 20px;
        margin-bottom: 16px;

        img {
            width: 50px;
            border-radius: 50%;
            margin-right: 16px;
        }

        h4 {
            font-weight: 600;
            font-size: 16px;
            color: #4f4f4f;
        }
    }

    .caption {
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

        .location-wrapper {
            display: flex;
            align-items: center;

            input {
                font-size: 17px;
                padding: 10px;
                width: 100%;
                border: 1px solid #e0e0e0;
                border-radius: 5px;
                margin-top: 10px;
            }
        }
    }

    .ingredients {
        padding: 0 20px 20px;

        h4 {
            margin-bottom: 10px;
        }

        .ingredient {
            display: flex;
            align-items: center;
            margin-bottom: 10px;

            textarea {
                width: 100%;
                min-height: 50px;
                font-size: 16px;
                border: 1px solid #e0e0e0;
                padding: 10px;
                border-radius: 5px;
                resize: vertical;
                margin-right: 10px;
            }

            button {
                background: #e0e0e0;
                border: none;
                padding: 10px;
                cursor: pointer;
                border-radius: 5px;

                &:hover {
                    background: #c0c0c0;
                }
            }
        }

        button {
            background: #037dcf;
            color: white;
            padding: 10px;
            font-size: 16px;
            font-weight: 600;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;

            &:hover {
                background: #025fa1;
            }
        }
    }

    .steps {
        padding: 0 20px 20px;

        h4 {
            margin-bottom: 10px;
        }

        .step {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            flex-direction: column;

            textarea {
                width: 100%;
                min-height: 50px;
                font-size: 16px;
                border: 1px solid #e0e0e0;
                padding: 10px;
                border-radius: 5px;
                resize: vertical;
                margin-bottom: 10px;
            }

            .step-image-preview {
                width: 100px;
                height: 100px;
                object-fit: cover;
                margin-bottom: 10px;
            }

            button {
                background: #e0e0e0;
                border: none;
                padding: 10px;
                cursor: pointer;
                border-radius: 5px;

                &:hover {
                    background: #c0c0c0;
                }
            }
        }

        button {
            background: #037dcf;
            color: white;
            padding: 10px;
            font-size: 16px;
            font-weight: 600;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;

            &:hover {
                background: #025fa1;
            }
        }
    }

    .difficulty {
        padding: 0 20px 20px;

        input,
        select {
            width: 100%;
            padding: 10px;
            font-size: 16px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            margin-bottom: 10px;
            background-color: #fafafa;
        }
    }
`;

export { MainWrapper, ContentWrapper };
