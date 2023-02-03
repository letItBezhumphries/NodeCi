import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import { fetchBlog } from "../../redux/actions";

const BlogShow = ({ blogs, fetchBlog }) => {
  const { _id } = useParams();
  const { title, content, imageUrl } = blogs[_id];

  const renderImage = () => {
    if (imageUrl) {
      return (
        <img
          src={
            `https://s3-us-west-2.amazonaws.com/myblogbucket3422/` + imageUrl
          }
        />
      );
    }
  };

  useEffect(() => {
    fetchBlog(_id);
  }, [fetchBlog, _id]);

  return (
    blogs[_id] && (
      <div>
        <h3>{title}</h3>
        <p>{content}</p>
        {renderImage()}
      </div>
    )
  );
};

function mapStateToProps({ blogs }, ownProps) {
  return { blogs };
}

export default connect(mapStateToProps, { fetchBlog })(BlogShow);
