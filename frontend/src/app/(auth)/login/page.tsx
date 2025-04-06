/* eslint-disable @next/next/no-img-element */
'use client';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import axios from 'axios';
import { useAuth } from '@/context/UserContext';

const LoginPage = () => {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('')
    const { layoutConfig } = useContext(LayoutContext);
    const {setUser} = useAuth()

    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });
     const hanbdleLogin = async()=>{
        try{
            const res = await axios.post('http://localhost:5000/api/auth/login',{
                email:email,
                password:password
            })
            
            const { token, user } = res.data;
            Cookies.set('token', token, {
                expires: 7, // days
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
            });
            setUser(user)
          router.push('/')
        }catch(error){
            console.log(error)
        }
        
     }
    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center"> 
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                    

                        <div>
                            <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">
                                Email
                            </label>
                            <InputText id="email1" type="email" placeholder="Email address" className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} 
                            onChange={(e)=>setEmail(e.target.value)}
                            />
                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                Password
                            </label>
                            <Password inputId="password1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" toggleMask className="w-full mb-5" inputClassName="w-full p-3 md:w-30rem"></Password>

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                            
                            </div>
                            <Button label="Sign In" className="w-full p-3 text-xl" onClick={hanbdleLogin}></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
