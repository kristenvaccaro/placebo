import React, { Component } from 'react';
import FeatureDropdown from './Dropdown.js'
import Slider  from 'rc-slider';
import { FREQUENCY, CELEBRITY, POPULARITY, POPULARITYRANDOM, CLOSENESS, SENTIMENT } from './TweetFilterer';

import { logger } from './Logger';

export default class FilterControl extends Component {
    constructor(props) {
        const LOW_NUMBER = -10000;
        super(props)
        let filterStatus = {};

        let currentFeature = POPULARITY;
        this.state = {
            currentFeature,
            filterStatus, 
            highChecked: false,
            lowChecked: false
        };
    }

    onFilterChange() {
        let filterStatus = this.state.filterStatus;
        let h = this.state.highChecked
        let l = this.state.lowChecked;
        const LOW = 10;
        const HIGH = 100;
        if(h && l) {
            filterStatus[this.state.currentFeature] = 
                (t) => t.getFeature(this.state.currentFeature) >= HIGH ||
                t.getFeature(this.state.currentFeature) <= LOW;
        } else if(!h && l) {
            filterStatus[this.state.currentFeature] = 
                (t) => t.getFeature(this.state.currentFeature) <= LOW;
        } else if(h && !l) {
            filterStatus[this.state.currentFeature] = 
                (t) => t.getFeature(this.state.currentFeature) >= HIGH;
        } else if(!h && !l) {
            filterStatus[this.state.currentFeature] = 
                (t) => true;
        }
        this.setState({filterStatus},
            (_, __) => this.props.onChange(filterStatus));
    }

    onDropdownChange(event, index, value) {
        logger.logInfo(`Changed to ${value} filtering`);
        this.setState({currentFeature: value});
    }


    getHighestPop(tweets) {
        return Math.max(...tweets.map(t => t.getPopularity()));
    }
    getLowestPop(tweets) {
        return Math.min(...tweets.map(t => t.getPopularity()));
    }

    getHighestPopRandom(tweets) {
        return Math.max(...tweets.map(t => t.getPopularity()));
    }
    getLowestPopRandom(tweets) {
        return Math.min(...tweets.map(t => t.getPopularity()));
    }

    getHighestFrequency(tweets) {
        return Math.max(...tweets.map(t => t.getFrequency()));
    }
    getLowestFrequency(tweets) {
        return Math.min(...tweets.map(t => t.getFrequency()));
    }

    getHighestCelebrity(tweets) {
        let out = Math.max(...tweets.map(t => t.getCelebrity()));
        return out;
    }
    getLowestCelebrity(tweets) {
        let out = Math.min(...tweets.map(t => t.getCelebrity()));
        return out;
    }

    getHighestCloseness(tweets) {
        let ret = Math.max(...tweets.map(t => t.getCloseness()));
        return ret;
    }
    getLowestCloseness(tweets) {
        let ret = Math.min(...tweets.map(t => t.getCloseness()));
        return ret;
    }

    getHighestSentiment(tweets) {
        return Math.max(...tweets.map(t => t.getSentiment()));
    }
    getLowestSentiment(tweets) {
        return Math.min(...tweets.map(t => t.getSentiment()));
    }

    getHighestFeature(feature) {
        const DEFAULT = 100;
        if(this.props.tweets.length === 0)
            return DEFAULT;

        let highest;
        switch(feature) {
            case FREQUENCY:
                highest = this.getHighestFrequency(this.props.tweets);
                break;
            case CELEBRITY:
                highest = this.getHighestCloseness(this.props.tweets);
                break;
            case CLOSENESS:
                highest = this.getHighestCloseness(this.props.tweets);
                break;
            case POPULARITY:
                highest = this.getHighestPop(this.props.tweets);
                break;
            case POPULARITYRANDOM:
                highest = this.getHighestPopRandom(this.props.tweets);
                break;
            case SENTIMENT:
                highest = this.getHighestSentiment(this.props.tweets);
                break;
            default:
                highest = DEFAULT;
                break;
        }
        return highest;
    }

    getLowestFeature(feature) {
        const DEFAULT = 0;
        if(this.props.tweets.length === 0)
            return DEFAULT;

        let lowest;
        switch(feature) {
            case FREQUENCY:
                lowest = this.getLowestFrequency(this.props.tweets);
                break;
            case CELEBRITY:
                lowest = this.getLowestCloseness(this.props.tweets);
                break;
            case CLOSENESS:
                lowest = this.getLowestCloseness(this.props.tweets);
                break;
            case POPULARITY:
                lowest = this.getLowestPop(this.props.tweets);
                break;
            case POPULARITYRANDOM:
                lowest = this.getLowestPopRandom(this.props.tweets);
                break;
            case SENTIMENT:
                lowest = this.getLowestSentiment(this.props.tweets);
                break;
            default:
                lowest = DEFAULT;
                break;
        }
        return lowest;
    }

    onLift(value) {
        logger.logInfo(`Changed slider to ${value} on ${this.state.currentFeature}`);
    }

    render() {
        let lowestFeature;
        let highestFeature;
        if(this.props.tweets !== undefined && this.props.tweets !== null) {
            lowestFeature = this.getLowestFeature(this.state.currentFeature)
            highestFeature = this.getHighestFeature(this.state.currentFeature)
        } else {
            lowestFeature = 0;
            highestFeature = 100;
        }
        return (
            <div className="row" onClick={this.props.onClick}>
                <span className={ this.props.dropdownClass }>
                    <FeatureDropdown onChange={ this.onDropdownChange.bind(this) } value={ this.state.currentFeature } />
                </span>
                <span className={ this.props.sliderClass }>
                    <label>
                        Show popular tweets
                        <input type="checkbox" name="highBox" checked={ this.state.highChecked } onChange={(e) => { this.setState({ highChecked: e.target.checked }); this.onChange(); }}>
                    <\label>

                    <label>
                        Show unpopular tweets
                        <input type="checkbox" name="lowBox" checked={ this.state.lowChecked } onChange={(e) => { this.setState({ lowChecked: e.target.checked }); this.onChange(); }}>
                    <\label>
                </span>
            </div>
        );
    }
}

FilterControl.defaultProps = {
    sliderClass: "slider",
    dropdownClass: "dropdown"
};
