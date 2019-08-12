import React, { Component } from 'react'
import axios from 'axios';
import Grid from '@material-ui/core/Grid'

import Scream from '../components/Scream'

class Home extends Component {
    state = {
        screams: null
    }
    componentDidMount() {
        axios.get('/getscreams')
            .then(res => {
                console.log(res.data)
                this.setState({
                    screams: res.data
                })
            })
            .catch(err => console.log(err));
    }
    render() {
        let recentScreamMarkup = this.state.screams ?
            this.state.screams.map((scream, i) => <Scream scream={scream}/>) : (
                <p>Loading....</p>
            )
        return (
            <Grid container spacing={10}>
                <Grid item sm={8} xs={12}>
                    {recentScreamMarkup}
                </Grid>
                <Grid item sm={4} xs={12}>
                    <p>Profile.....</p>
                </Grid>
            </Grid>
        )
    }
}

export default Home