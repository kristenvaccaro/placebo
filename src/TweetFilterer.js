import 'rc-slider/assets/index.css';
const FREQUENCY = "Frequency";
const CELEBRITY = "Celebrity";
const POPULARITY = "Popularity";
const POPULARITYRANDOM = "PopularityRandom";
const CLOSENESS = "Closeness";
const SENTIMENT = "Sentiment";
export default class TweetFilterer {
  constructor(tweets) {
    this.data = tweets;
  }

  async filterTweets(filterObject) {
      let _filterTweets = (tweets, filterObject) => {
          let filterOne = (t) => {
              for(let f of filterObject)
                  if(!f(t))
                      return false;
              return true;
          }
        tweets = tweets.filter(filterOne);
        return tweets;
      };

      if(filterObject === null)
          return [];

      if(this.data === null) {
          throw new Error("There are no tweets!");
      }
      let ret = _filterTweets(this.data, filterObject);
      return ret;
  }

}
export { TweetFilterer, FREQUENCY, CELEBRITY, POPULARITY, POPULARITYRANDOM, CLOSENESS, SENTIMENT };
