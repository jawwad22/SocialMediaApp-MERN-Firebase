import React, { Component } from 'react'
import axios from 'axios';
import Grid from '@material-ui/core/Grid'

import Scream from '../components/Scream'
import Profile from '../components/profile/Profile'

class Home extends Component {
    state = {
        screams: null
    }
    componentDidMount() {
        axios.get('/getscreams')
            .then(res => {
                this.setState({
                    screams: res.data
                })
            })
            .catch(err => console.log(err));
    }
    render() {
        let recentScreamMarkup = this.state.screams ?
            this.state.screams.map((scream, i) => <Scream key={i} scream={scream} />) : (
                <p>Loading....</p>
            )
        return (
            <Grid container spacing={10}>
                <Grid item sm={8} xs={12}>
                    {recentScreamMarkup}
                </Grid>
                <Grid item sm={4} xs={12}>
                    <Profile />
                </Grid>
            </Grid>
        )
    }
}

export default Home
