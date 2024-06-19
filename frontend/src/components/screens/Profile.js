import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate, Link, Outlet } from "react-router-dom";
import { Helmet } from "react-helmet";

import axios from "../../config/axiosConfig";
import profile from "../../assets/images/blank-profile.webp";
import settings from "../../assets/icons/settings.svg";
import MainLoader from "../UI/MainLoader";
import { authActions } from "../../store/authSlice";
import { alertActions } from "../../store/alertSlice";
import PostModal from "../modal/PostModal";


function Profile() {
    const access = useSelector((state) => state.auth.token.access);
    const userData = useSelector((state) => state.auth.userData);

    const [userObject, setUserObject] = useState({});
    const [posts, setPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [isAuthor, setIsAuthor] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [followingsCount, setFollowingsCount] = useState(0);
    const [followersCount, setFollowersCount] = useState(0);
    const [showPost, setShowPost] = useState(null);
    const [activeTab, setActiveTab] = useState("posts");

    const { username } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const deletePost = (id) => {
        const newPosts = posts.filter((post) => post.id !== id);
        setPosts(newPosts);
    };

    const config = {
        headers: {
            authorization: `Bearer ${access}`,
        },
    };

    const followHandler = () => {
        axios
            .get(`users/${userObject.id}/follow/`, config)
            .then((res) => {
                console.log(res.data);
                setIsFollowing(res.data.isFollowing);
                setFollowersCount(res.data.followersCount);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        console.log(username);
        axios
            .get(`users/${username}/`, config)
            .then((res) => {
                console.log(res.data);
                setIsLoading(false);
                if (res.data.statusCode !== 6001) {
                    setUserObject(res.data.data);
                    setPosts(res.data.posts);
                    setIsAuthor(res.data.is_author);
                    setIsFollowing(res.data.data.isFollowing);
                    setFollowingsCount(res.data.data.followings_count);
                    setFollowersCount(res.data.data.followers_count);
                } else {
                    navigate("/");
                    dispatch(
                        alertActions.addAlert({
                            type: "err",
                            message: "Page not found",
                        })
                    );
                }
            })
            .catch((err) => {
                console.log(err);
                if (err.response.status === 401) {
                    dispatch(authActions.logout());
                }
            });
    }, [username, userData]);

    useEffect(() => {
        if (activeTab === "savedPosts") {
            axios
                .get("posts/saved-posts/", config)
                .then((res) => {
                    console.log(res.data);
                    setSavedPosts(res.data.data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [activeTab]);

    return (
        <>
            <Helmet>
                <title>{username}</title>
            </Helmet>
            {isLoading ? (
                <MainLoader />
            ) : (
                <>
                    <TopWrapper>
                        <TopLeft className="left">
                            <img
                                src={
                                    userObject?.image
                                        ? userObject?.image
                                        : profile
                                }
                                alt=""
                            />
                        </TopLeft>
                        <TopRight className="right">
                            <NameContainer>
                                <h3>{userObject?.user?.username}</h3>
                                {isAuthor ? (
                                    <Link to="settings/">
                                        <img src={settings} alt="" />
                                    </Link>
                                ) : !isFollowing ? (
                                    <span
                                        className="btn"
                                        onClick={followHandler}
                                    >
                                        follow
                                    </span>
                                ) : (
                                    <span
                                        className="btn unfollow"
                                        onClick={followHandler}
                                    >
                                        unfollow
                                    </span>
                                )}
                            </NameContainer>
                            <FollowDetails>
                                <h5>
                                    <span>{posts.length}</span>posts
                                </h5>
                                <Link to={`/${username}/followers/`}>
                                    <span>{followersCount}</span>followers
                                </Link>
                                <Link to={`/${username}/following/`}>
                                    <span>{followingsCount}</span>followings
                                </Link>
                            </FollowDetails>
                            <Bio>
                                <h4>{userObject.name}</h4>
                                {userObject.bio && <p>{userObject.bio}</p>}
                            </Bio>
                        </TopRight>
                    </TopWrapper>
                    <TabWrapper>
                        <Tab onClick={() => setActiveTab("posts")} active={activeTab === "posts"}>
                            your recipes
                        </Tab>
                        <Tab onClick={() => setActiveTab("savedPosts")} active={activeTab === "savedPosts"}>
                            <span>Saved</span>
                        </Tab>
                    </TabWrapper>
                    <BottomWrapper>
                        {activeTab === "posts" &&
                            posts.map((post) => (
                                <PostCard key={post.id}>
                                    <PostWrapper onClick={() => setShowPost(post.id)}>
                                        <img src={post.images[0].image} alt="" />
                                    </PostWrapper>
                                </PostCard>
                            ))}
                        {activeTab === "savedPosts" &&
                            savedPosts.map((post) => (
                                <PostCard key={post.id}>
                                    <PostWrapper onClick={() => setShowPost(post.id)}>
                                        <img src={post.images[0].image} alt="" />
                                    </PostWrapper>
                                </PostCard>
                            ))}
                        {/* {activeTab === "yourPosts" &&
                            posts
                                .filter((post) => post.is_author)
                                .map((post) => (
                                    <PostCard key={post.id}>
                                        <CloseButton onClick={() => deletePost(post.id)}>
                                            &times;
                                        </CloseButton>
                                        <PostWrapper onClick={() => setShowPost(post.id)}>
                                            <img src={post.images[0].image} alt="" />
                                        </PostWrapper>
                                    </PostCard>
                                ))} */}
                    </BottomWrapper>
                    {showPost && (
                        <PostModal
                            id={showPost}
                            url={`/${username}/`}
                            deletePost={deletePost}
                            onClose={() => {
                                window.history.replaceState(null, "", `/${username}/`);
                                setShowPost(null);
                            }}
                        />
                    )}
                </>
            )}
            <Outlet />
        </>
    );
}

export default Profile;

const TopWrapper = styled.div`
    max-width: 750px;
    margin: 0 auto;
    margin-top: 64px;
    display: flex;
    align-items: center;
    padding-top: 40px;
`;

const TopLeft = styled.div`
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
        width: 130px;
        border-radius: 50%;
        padding: 5px;
        border: 2px solid #99999938;
        cursor: pointer;
    }
`;

const TopRight = styled.div`
    width: 50%;
`;

const NameContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;

    img {
        width: 26px;
        cursor: pointer;
    }
    h3 {
        font-size: 24px;
        color: #676767;
    }
    span.btn {
        padding: 6px 18px;
        border-radius: 5px;
        background: #0095f6;
        font-weight: 600;
        color: #fff;
        cursor: pointer;
        &.unfollow {
            background: none;
            border: 1px solid #9999997e;
            color: #444444;
        }
    }
`;

const FollowDetails = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    h5,a {
        font-size: 16px;
        margin-right: 20px;
        color: #595959;
        cursor: pointer;

        &:first-child {
            cursor: default;
        }
        span {
            color: #111;
            margin-right: 8px;
            font-weight: 600;
        }
    }
`;

const Bio = styled.div`
    h4 {
        font-size: 17px;
        font-weight: 600;
        margin-bottom: 18px;
    }
    p {
        line-height: 24px;
        font-size: 17px;
        letter-spacing: 0.5px;
    }
`;

const TabWrapper = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 20px;
`;

const Tab = styled.div`
    padding: 10px 20px;
    cursor: pointer;
    border-bottom: 2px solid ${props => props.active ? '#0095f6' : 'transparent'};
    color: ${props => props.active ? '#0095f6' : '#676767'};
    font-weight: ${props => props.active ? '600' : '400'};
`;

const BottomWrapper = styled.div`

    border-top: 1px solid #8080809c;
    width: 60%;
    display: flex;
    flex-wrap: wrap;
    gap: 2%;
    margin: 48px auto 32px;
    padding: 30px;
`;

const PostCard = styled.div`
  
    width: 32%;
    margin-bottom: 20px;
`;

// const CloseButton = styled.button`
//     position: absolute;
//     top: 5px;
//     right: 5px;
//     padding: 5px;
//     border: none;
//     background-color: transparent;
//     color: #999;
//     cursor: pointer;
//     font-size: 20px;
//     transition: color 0.3s;

//     &:hover {
//         color: #666;
//     }
// `;

const PostWrapper = styled.div`
   
    overflow: hidden;

    img {
        width: 100%;
        height: auto;
        cursor: pointer;
    }
`;
