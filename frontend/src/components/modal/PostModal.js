import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Slider from "react-slick";
import styled from "styled-components";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import axios from "../../config/axiosConfig";
import InnerLoader from "../UI/InnerLoader";
import dots from "../../assets/icons/3dots.png";
import smile from "../../assets/icons/smile.png";
import ActionsModal from "./ActionsModal";
import Header from "../includes/Header";
import { postActions } from "../../store/postSlice";
import EditPostModal from "./EditPostModal";

const PostModal = ({
    id,
    onClose = () => {
        console.log("default");
    },
    url,
    deletePost = false,
    editPost = false,
}) => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const dispatch = useDispatch();

    const [post, setPost] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [showEditPost, setShowEditPost] = useState(editPost);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [commentAction, setCommentAction] = useState(false);

    const access = useSelector((state) => state.auth.token.access);
    const username = useSelector((state) => state.auth.userData.username);

    const config = {
        headers: {
            authorization: `Bearer ${access}`,
        },
    };

    const DeletePostHandler = (e) => {
        Swal.fire({
            title: "Confirm!",
            text: "Are you sure you want to delete this post?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete it",
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`posts/${post.id}/delete/`, config)
                    .then((response) => {
                        console.log(response.data);
                        if (response.data.statusCode === 6000) {
                            onClose();
                            deletePost(post.id);
                            dispatch(
                                postActions.deletePost({ postId: post.id })
                            );
                            navigate(`/${username}/`);
                        }
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            }
        });
    };

    const create_comment = () => {
        if (newComment.trim() !== "") {
            axios
                .post(
                    `posts/${post.id}/comments/create/`,
                    {
                        message: newComment,
                    },
                    config
                )
                .then((res) => {
                    console.log(res.data);
                    setComments([res.data.data, ...comments]);
                    setNewComment("");
                })
                .catch((err) => {
                    console.log(err.message);
                });
        }
    };

    const deleteComment = (e) => {
        axios
            .delete(`posts/comments/${commentAction.id}/delete`, config)
            .then((res) => {
                console.log(res.data);
                if (res.data.deleted) {
                    const filteredComment = comments.filter(
                        (comment) => comment.id !== commentAction.id
                    );
                    setComments(filteredComment);
                    setCommentAction(false);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        if (postId && !id) {
            id = postId;
        }
        window.history.replaceState(null, "", `/p/${id}/`);
        if (Object.keys(post).length === 0) {
            setIsLoading(true);
            axios
                .get(`posts/${id}/`, config)
                .then((res) => {
                    console.log(res.data);
                    setPost(res.data.data);
                    setIsLoading(false);
                    setComments(res.data.data.comments);
                })
                .catch((e) => {
                    console.log(e);
                    setIsLoading(false);
                });
        }
    }, []);

    const settings = {
        arrows: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    return (
        <>
            {showEditPost && (
                <EditPostModal
                    post={post}
                    onClose={() => setShowEditPost(false)}
                />
            )}
            {showActions && (
                <ActionsModal onClose={() => setShowActions(false)}>
                    {post.isAuthor && (
                        <>
                            <li onClick={() => {
                                setShowActions(false);
                                setShowEditPost(true);
                            }}>Edit post</li>
                            <li className="danger" onClick={DeletePostHandler}>Delete post</li>
                        </>
                    )}
                </ActionsModal>
            )}

            {commentAction && (
                <ActionsModal onClose={() => setCommentAction(false)}>
                    <li>Report</li>
                    {commentAction.isAuthor && (
                        <li className="danger" onClick={deleteComment}>Delete</li>
                    )}
                </ActionsModal>
            )}
            <MainWrapper
                onClick={(e) => onClose()}
                className={`${postId && "postId"}`}
            >
                {postId && <Header />}
                <ContentWrapper
                    onClick={(e) => e.stopPropagation()}
                    className={`${postId && "content-wrapper"}`}
                >
                    <ImageCarousel>
                        <Slider {...settings}>
                            {post.images?.map((image) => (
                                <div key={image.id}>
                                    <img src={image?.image} alt="" />
                                </div>
                            ))}
                        </Slider>
                    </ImageCarousel>
                    <DetailsWrapper>
                        <Card>
                            <AuthorWrapper>
                                <div className="left">
                                    <Link to={`/${post?.author?.username}/`}>
                                        <img src={post?.author?.image} alt="" />
                                    </Link>
                                    <div>
                                        <Link to={`/${post?.author?.username}/`}>
                                            {post?.author?.username}
                                        </Link>
                                    </div>
                                </div>
                                <div className="right">
                                    <img src={dots} alt="" onClick={() => setShowActions(true)} />
                                </div>
                            </AuthorWrapper>
                        </Card>
                        {post.location && (
                            <Card>
                                <LocationCard>
                                    <h2>Title</h2>
                                    <p>{post.location}</p>
                                </LocationCard>
                            </Card>
                        )}
                        {post.ingredients && (
                            <Card>
                                <IngredientsCard>
                                    <h2>Ingredients</h2>
                                    {post.ingredients.split(",").map((ingredient, index) => (
                                        <Ingredient key={index}>{ingredient.trim()}</Ingredient>
                                    ))}
                                </IngredientsCard>
                            </Card>
                        )}
                        {post.description && (
                            <Card>
                                <DescriptionCard>
                                    <h2>Cooking Instructions</h2>
                                    <p>{post.description}</p>
                                </DescriptionCard>
                            </Card>
                        )}
                        {post.steps && (
                            <Card>
                                <StepsCard>
                                    <h2>Steps</h2>
                                    {post.steps.map((step, index) => (
                                        <div key={index}>
                                            <p>{step.text}</p>
                                            {step.image && (
                                                <img src={step.image} alt={`Step ${index + 1}`} />
                                            )}
                                        </div>
                                    ))}
                                </StepsCard>
                            </Card>
                        )}
                        <CommentsSection>
                            {comments.map((comment) => (
                                <Comment key={comment.id}>
                                    <div className="left">
                                        <Link to={`/${comment?.author?.username}/`}>
                                            <img src={comment.author.image} alt="" />
                                        </Link>
                                    </div>
                                    <div className="right">
                                        <p>
                                            <Link to={`/${comment?.author?.username}/`}>
                                                {comment.author.username}
                                            </Link>
                                            {comment.message}
                                        </p>
                                        <img src={dots} alt="" onClick={() => setCommentAction(comment)} />
                                    </div>
                                </Comment>
                            ))}
                        </CommentsSection>
                        <CommentInput>
                            <img src={smile} alt="" />
                            <input
                                type="text"
                                placeholder="Add a Comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button onClick={create_comment}>Post</button>
                        </CommentInput>
                    </DetailsWrapper>
                </ContentWrapper>
                {isLoading && (
                    <LoaderWrapper>
                        <InnerLoader />
                    </LoaderWrapper>
                )}
            </MainWrapper>
        </>
    );
};

export default PostModal;

const MainWrapper = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
   
    padding: 20px;
`;

const ContentWrapper = styled.div`
    width: 60%;
    background: #fff;
    margin-top: 400px;
    

    display: flex;
    flex-direction: column;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    overflow: hidden;
    max-width: 800px;
`;

const ImageCarousel = styled.div`
    width: 100%;
    margin-top: 100px;
    .slick-slider {
        .slick-slide {
            img {
                width: 100%;
                max-height: 60vh;
                object-fit: cover;
            }
        }
    }
`;

const DetailsWrapper = styled.div`
    padding: 20px;
`;

const Card = styled.div`
    background: #fafafa;
    border-radius: 10px;
    margin-bottom: 20px;
    padding: 20px;
`;

const AuthorWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .left {
        display: flex;
        align-items: center;

        a {
            display: flex;
            align-items: center;
            color: #333;
            font-weight: 600;
            text-decoration: none;

            img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                margin-right: 10px;
            }
        }
    }

    .right {
        img {
            width: 20px;
            cursor: pointer;
        }
    }
`;

const LocationCard = styled.div`
    h2 {
        font-size: 18px;
        margin-bottom: 5px;
    }

    p {
        font-size: 16px;
        color: #666;
    }
`;

const DescriptionCard = styled.div`
    h2 {
        font-size: 18px;
        margin-bottom: 5px;
    }

    p {
        font-size: 16px;
        color: #666;
    }
`;

const IngredientsCard = styled.div`
    h2 {
        font-size: 18px;
        margin-bottom: 5px;
    }
`;

const Ingredient = styled.p`
    font-size: 16px;
    color: #666;
    margin: 5px 0;
`;

const StepsCard = styled.div`
    h2 {
        font-size: 18px;
        margin-bottom: 5px;
    }

    div {
        margin-bottom: 10px;

        p {
            font-size: 16px;
            color: #666;
        }

        img {
            width: 40%;
            max-height: 200px;
            object-fit: cover;
            border-radius: 10px;
        }
    }
`;

const CommentsSection = styled.div`
    h2 {
        font-size: 18px;
        margin-bottom: 10px;
    }
`;

const Comment = styled.div`
    display: flex;
    align-items: flex-start;
    margin-bottom: 10px;

    .left {
        margin-right: 10px;

        a {
            display: block;

            img {
                width: 30px;
                height: 30px;
                border-radius: 50%;
            }
        }
    }

    .right {
        flex: 1;

        p {
            margin: 0;
            font-size: 14px;

            a {
                font-weight: 600;
                margin-right: 5px;
                text-decoration: none;
                color: #333;
            }
        }

        img {
            width: 16px;
            cursor: pointer;
            margin-top: 5px;
        }
    }
`;

const CommentInput = styled.div`
    display: flex;
    align-items: center;
    border-top: 1px solid #e6e6e6;
    padding: 10px 0;

    img {
        width: 30px;
        margin-right: 10px;
    }

    input {
        flex: 1;
        border: none;
        padding: 10px;
        font-size: 14px;
        outline: none;
    }

    button {
        background: none;
        border: none;
        color: #0095f6;
        font-weight: 600;
        cursor: pointer;
        padding: 10px;
    }
`;

const LoaderWrapper = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export {
    MainWrapper,
    ContentWrapper,
    ImageCarousel,
    DetailsWrapper,
    Card,
    AuthorWrapper,
    LocationCard,
    DescriptionCard,
    IngredientsCard,
    StepsCard,
    CommentsSection,
    Comment,
    CommentInput,
    LoaderWrapper,
};
