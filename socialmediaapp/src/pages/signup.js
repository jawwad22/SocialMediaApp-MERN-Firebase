import React, { Component } from 'react'
import withStyles from '@material-ui/core/styles/withStyles'
import PropTypes from 'prop-types';
import AppIcon from '../images/icon.png'
import axios from 'axios'


//Mui Stuff
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'

const Link = require('react-router-dom').Link


const styles = (theme) => ({
    ...theme.spreadThis
  });
class SignUp extends Component {

    constructor() {
        super();
        this.state = {
            email: '',
            password: '',
            confirmPassword: '',
            handle: '',
            loading: false,
            errors: {}
        }
    }
    handleSubmit = (event) => {
        event.preventDefault();
        this.setState({
            loading: true
        })
        const newUserData = {
            email: this.state.email,
            password: this.state.password,
            "confirmPassword": this.state.confirmPassword,
            "handle": this.state.handle,
        }
        axios.post('/signup', newUserData)
            .then(res => {
                localStorage.setItem('FBIdToken', `Bearer ${res.data.token}`)
                this.setState({
                    loading: false
                })
                this.props.history.push('/')
            })
            .catch(err => {
                console.log(err)
                this.setState({
                    errors: err.response.data,
                    loading: false,
                })
            })
    }
    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }
    render() {
        const { classes } = this.props;
        const { errors, loading } = this.state
        return (
            <Grid
                container className={classes.form}>
                <Grid item sm />
                <Grid item sm>
                    <img src={AppIcon} alt="appIcon" className={classes.image} />
                    <Typography varient="h2" className={classes.pageTitle}>
                        Sign Up
                </Typography>
                    <form noValidate onSubmit={this.handleSubmit}>
                        <TextField id="email" name="email" type="email"
                            label="Email" className={classes.textField}
                            helperText={errors.email}
                            error={errors.email ? true : false}
                            value={this.state.email} onChange={this.handleChange}
                            fullWidth />
                       
                        <TextField id="password" name="password" type="password"
                            label="Password" className={classes.textField}
                            helperText={errors.password}
                            error={errors.password ? true : false}
                            value={this.state.password} onChange={this.handleChange}
                            fullWidth />
                       
                        <TextField id="confirmPassword" name="confirmPassword" type="password"
                            label="Confirm Password" className={classes.textField}
                            helperText={errors.confirmPassword}
                            error={errors.confirmPassword ? true : false}
                            value={this.state.confirmPassword} onChange={this.handleChange}
                            fullWidth />
                        
                        <TextField id="handle" name="handle" type="text"
                            label="Handle Name" className={classes.textField}
                            helperText={errors.handle}
                            error={errors.handle ? true : false}
                            value={this.state.handle} onChange={this.handleChange}
                            fullWidth />
                       
                        <Button
                            disabled={loading}
                            type='submit' varient="contained" color="primary" className={classes.button}>
                            Sign Up
                            {loading && (
                                <CircularProgress
                                    size={30}
                                    className={classes.progress} />
                            )}
                        </Button><br/>
                        <small>Already have an account ? Login <Link to="/login">here</Link></small>
                      
                        {errors.general && (
                            <Typography varient='body2' className={classes.customError}>
                                {errors.general}
                            </Typography>
                        )}
                    </form>
                </Grid>
                <Grid item sm />

            </Grid>
        )
    }
}

SignUp.propType = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(SignUp);
