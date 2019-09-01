import React, { Component } from 'react'
import axios from 'axios';
import Grid from '@material-ui/core/Grid'
import PropTypes from 'prop-types';

import Scream from '../components/scream/Scream'
import Profile from '../components/profile/Profile'

import { connect } from 'react-redux';
import { getScreams } from '../redux/actions/dataActions';

class Home extends Component {

    componentDidMount() {
        this.props.getScreams();
    }
    render() {
        const { screams, loading } = this.props.data
        let recentScreamMarkup = !loading ? (
            screams.map((scream, i) => <Scream key={i} scream={scream} />)
        ) : (
                <p>Loading....</p>
            )
        console.log('SCREAMS', this.props.data)
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

Home.propTypes = {
    getScreams: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
    data: state.data
});

export default connect(
    mapStateToProps,
    { getScreams }
)(Home);
