import React, { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

import axios from "../../config/axiosConfig";
import Post from "../includes/Post";
import { Helmet } from "react-helmet";
import Loader from "../UI/Loader";
import { postActions } from "../../store/postSlice";

function Home() {
    const access = useSelector((state) => state.auth.token.access);
    const dispatch = useDispatch();
    const posts = useSelector((state) => state.posts);

    const [isLoading, setIsLoading] = useState(false);
    const [isEmptyPost, setIsEmptyPost] = useState(false);

    const config = {
        headers: {
            authorization: `Bearer ${access}`,
        },
    };

    useEffect(() => {
        setIsLoading(true);
        const controller = new AbortController();
        axios
            .get("posts/all/", config, {
                signal: controller.signal,
            })
            .then((response) => {
                const data = response.data;
                console.log(data);
                if (data.length === 0) {
                    setIsEmptyPost(true);
                    dispatch(postActions.initialPost([]));
                } else {
                    const sortedArray = data.sort(
                        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                    );
                    dispatch(postActions.initialPost(sortedArray.reverse()));
                }
            })
            .then((res) => {
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
            });

        return () => {
            controller.abort();
        };
    }, []);

    return (
        <>
            {isLoading && <Loader />}
            <Helmet>
                <title>Ajin</title>
            </Helmet>
            <MainWrapper>
                {isEmptyPost ? (
                    <div className="emptyPost">
                        <h1>Explore to see posts</h1>
                        <Link to="/explore/">explore</Link>
                    </div>
                ) : (
                    posts.map((post) => <PostCard key={post.id}><Post post={post} /></PostCard>)
                )}
            </MainWrapper>
            <Outlet />
        </>
    );
}

export default Home;

const MainWrapper = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin: 100px auto 0;
    padding: 20px;
    background: #f0f0f0;
`;

const PostCard = styled.div`
    background: #fff;
    border-radius: 10px;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
`;
