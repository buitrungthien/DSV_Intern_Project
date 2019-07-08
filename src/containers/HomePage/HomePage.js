import React from 'react';
import * as CommonConstants from '../../constants/index';
import Modal from '../../components/UI/Modal/Modal';
import RegisterForm from '../../components/RegisterForm/RegisterForm';
import LogInForm from '../../components/LogInForm/LogInForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Spinner from '../../components/UI/Spinner/Spinner';
import Header from '../../components/Header/Header';

class HomePage extends React.Component {

    state = {
        spinnerLoadingCounter: 0,
        modalOpen: false,
        typeOfForm: '',
        currentUser: {
            id: '',
            isSeller: false,
            name: '',
            email: ''
        },
        isLogedIn: false
    }

    async componentWillMount() {
        this.setState((prevState, props) => {
            return {
                spinnerLoadingCounter: prevState.spinnerLoadingCounter + 1
            }
        });
        if (localStorage.getItem('token')) {
            const response = await axios.get('http://localhost:5000/api/users/me', {
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                }
            });
            this.setState((prevState, props) => {
                return {
                    spinnerLoadingCounter: prevState.spinnerLoadingCounter - 1
                }
            });
            if (response) {
                this.setState({
                    isLogedIn: true,
                    currentUser: {
                        id: response.data._id,
                        isSeller: response.data.isSeller,
                        name: response.data.name,
                        email: response.data.email
                    }
                });
            }
        } else {
            this.setState((prevState, props) => {
                return {
                    spinnerLoadingCounter: prevState.spinnerLoadingCounter - 1
                }
            });
        }
    }

    formCloseHandler = () => {
        this.setState({
            modalOpen: false
        });
    }

    openRegisterFormHandler = () => {
        this.setState({
            modalOpen: true,
            typeOfForm: CommonConstants.FORM_TYPES.register
        });
    }

    openLogInFormHandler = () => {
        this.setState({
            modalOpen: true,
            typeOfForm: CommonConstants.FORM_TYPES.normalLogIn
        });
    }

    changeFormHandler(typeOfForm) {
        this.setState({
            typeOfForm: typeOfForm
        });
    }

    notify = (message, isSuccess) => {
        isSuccess ? toast.success(message) : toast.error(message);
    }

    storeToken = async (token) => {
        localStorage.setItem("token", token);
        const response = await axios.get('http://localhost:5000/api/users/me', {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        if (response) {
            this.setState({
                isLogedIn: true,
                currentUser: {
                    id: response.data._id,
                    isSeller: response.data.isSeller,
                    name: response.data.name,
                    email: response.data.email
                }
            });
        }
    }

    logOut = () => {
        localStorage.removeItem('token');
        this.setState({
            currentUser: {},
            isLogedIn: false
        });
    }

    render() {
        return (
            <React.Fragment>
                <Header 
                    isLogedIn={this.state.isLogedIn}
                    registerButtonClicked={this.openRegisterFormHandler}
                    logInButtonClicked={this.openLogInFormHandler}
                    logOutButtonClicked={this.logOut}
                />
                <Spinner display={this.state.spinnerLoadingCounter !== 0 ? 'block' : 'none'} />
                <ToastContainer autoClose={1500} />
                <h1>This is the Home Page</h1>
                {
                    this.state.modalOpen ?
                        <Modal show={this.state.modalOpen} closeModal={this.formCloseHandler}>
                            {
                                this.state.typeOfForm === CommonConstants.FORM_TYPES.register ?
                                    <RegisterForm changeForm={() => this.changeFormHandler(CommonConstants.FORM_TYPES.normalLogIn)} />
                                    : this.state.typeOfForm === CommonConstants.FORM_TYPES.normalLogIn ?
                                        <LogInForm
                                            changeForm={() => this.changeFormHandler(CommonConstants.FORM_TYPES.register)}
                                            logInNotify={this.notify}
                                            closeModal={this.formCloseHandler}
                                            token={this.storeToken}
                                        />
                                        : null
                            }
                        </Modal>
                        : null
                }
            </React.Fragment>
        );
    }
}

export default HomePage;