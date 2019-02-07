import React, { Component } from "react";
import Moment from "react-moment";
import "moment-timezone";
import "./TweetView.css";

export default class TweetView extends Component {
  render() {
    let tweet = this.props.tweet;
    const created_at = new Date(tweet.created_at);
    let time_difference = <Moment fromNow>{created_at}</Moment>;
    let retweet_status = null;
    if (tweet.hasOwnProperty("retweeted_status")) {
      retweet_status = (
        <p className="col offset-sm-2 offset-md-1">
          <i className="fas fa-retweet mr-2" />
          {tweet.user.screen_name} retweeted
        </p>
      );
    }

    let media = null;
    if (tweet.entities.media) {
      media = (
        <img
          className="img-fluid rounded w-50"
          width={tweet.entities.media[0].sizes.thumb.w * 4.5}
          src={tweet.entities.media[0].media_url}
          alt="tweet img"
        />
      );
    }

    let counts = (
      <p className="mt-2">
        {tweet.retweeted ? (
          <span style={{ color: "#66ff99" }} className="mlr-2">
            <i className="fas fa-retweet mlr-1" />
            {tweet.retweet_count}
          </span>
        ) : (
          <span className="mr-2">
            <i className="fas fa-retweet mr-1" /> {tweet.retweet_count}
          </span>
        )}

        {tweet.favorited ? (
          <span style={{ color: "#ff6699" }} className="mlr-2">
            <i className="fas fa-heart mr-1" />
            {tweet.favorite_count}
          </span>
        ) : (
          <span className="mlr-2">
            <i className="far fa-heart mr-1" />
            {tweet.favorite_count}
          </span>
        )}
      </p>
    );

    /**
     * Append anchor tag to links and replace escaped &amp; ish with & ish
     */
    const format = (text, values) => {
      if (!values.length) {
        return <p>{text}</p>;
      }
      let parts = [];
      let prev_index = 0;
      for (let i = 0; i < values.length; i++) {
        parts.push([...text].slice(prev_index, values[i].indices[0]).join(""));
        parts.push(
          <a
            title={values[i].expanded_url}
            href={values[i].url}
            key={values[i].url}
          >
            {values[i].url}
          </a>
        );
        prev_index = values[i].indices[1];
      }
      parts.push([...text].slice(prev_index).join(""));

      return <p>{parts}</p>;
    };

    let full_text = format(
      [...(tweet.getText())].slice(
        tweet.display_text_range[0],
        tweet.display_text_range[1]
      ),
      tweet.entities.urls
    );

    return (
      <div id="tweet" className="row justify-content-center">
        {retweet_status}
        <div className="w-100" />
        <a className="col-xs-2 col-md-1" href={tweet.user.url}>
          <img
            className="img-fluid rounded-circle"
            src={tweet.user.profile_image_url}
            alt="tweet profile"
          />
        </a>
        <span className="col">
          <a href={tweet.user.url}>
            <b>{tweet.user.name}</b>
          </a>{" "}
          <span style={{ color: "#808080" }}>
            @{tweet.user.screen_name} • {time_difference}
          </span>
          {full_text}
          {media}
          {counts}
        </span>
      </div>
    );
  }
}
