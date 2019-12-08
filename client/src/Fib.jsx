import React, { Component } from 'react';

import axios from 'axios';

export default class Fib extends Component {
    state = {
        seenIndexes: [],
        values: {},
        index: ''
    }
    
    componentDidMount() {
        this.fetchIndexes();
        this.fetchValues();
    }

    async fetchIndexes() {
        const seenIndexes = await axios.get('/api/values/all');

        this.setState({
            seenIndexes: seenIndexes.data
        });
    }

    async fetchValues() {
        const values = await axios.get('/api/values/current');

        this.setState({
            values: values.data
        })

    }

    async handleSubmit(e) {
        e.preventDefault();

        await axios.post('/api/values', {
            index: this.state.index
        });

        this.setState({
            index: ''
        });
    }

    renderSeenIndexes() {
        return (
            <div>
                {
                    this.state.seenIndexes.map(({ number }) => number).join(',')
                }
            </div>
        )
    }

    renderValues() {
        return (
            <div>
                {
                    Object.keys(this.state.values)
                        .map((k, i) => {
                            return (
                                <div key={k}>
                                    For index {i} I calculated {this.state.values[k]}
                                </div>
                            )
                        })

                }
            </div>
        )
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <label htmlFor="index">Enter your Index:</label>
                    <input value={this.state.index} onChange={(e) => this.setState({ index: e.target.value })} type="text" />
                    <button type="submit" >Submit</button>
                </form>

                <h3>Indexes I have seen:</h3>
                {
                    this.renderSeenIndexes()
                }

                <h3>Calculated values:</h3>
                {
                    this.renderValues()
                }

            </div>
        )
    }
}