import {useState} from "react";
import { useNavigate } from "react-router";
import api from "../api/axios";

export default function Signup(){
    const [form,setForm] = useState({
        name:"",
        email:"",
        password:""
    })
    const [msg,setMsg] = useState("");
    const navigate = useNavigate();

    const handleChange=(e)=>{
        setForm({
            ...form,
            [e.target.name]:e.target.value
        });
    }

    const handleSubmit=async(e)=>{
        e.preventDefault();

        try{
            const response = await api.post("/auth/signup",form);
            setMsg(response.data.message);
            setTimeout(() => {
            navigate("/");
            }, 1000);

        }catch(err){
            setMsg(err.response?.data?.message || "An error occurred");
        }
    }

    return(
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4"> 
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

                {msg && (
                    <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">
                        {msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name='name' placeholder="Enter Name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 required"/>
                    <input name='email' type="email" placeholder="Enter Email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 required"/>
                    <input name='password' type="password" placeholder="Enter Password" value={form.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 required"/>
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-mb hover:bg-blue-600">
                    Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
}