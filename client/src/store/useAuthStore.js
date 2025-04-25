import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js"
import toast from "react-hot-toast";
// import { LogOut } from "lucide-react";
import { io } from "socket.io-client"

const BASE_URL = mport.meta.env.MODE =="development"?  "http://localhost:3000": "/"

export const useAuthStore = create((set,get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSingingUp: false,
    isLoggingIn: false,
    isUpdateingProfile:false,
    onlineUsers: [],
    socket:null,
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/checkAuth")
            set({ authUser: res.data })
            get().connectSocket();
        } catch (error) {
            console.log("error in checkAuth:", error)
            set({ authUser: null })
        } finally {
            set({
                isCheckingAuth: false
            })
        }
    },
    signUp: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success(res.data.message);
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },
    logout: async () => {
        try {
            const res= await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            console.log("user logged out!")
            toast.success(res.data.message);
            get().disconnectSocket();
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message);
        }
    },
    login: async (data) =>{
        set({isLoggingIn:true})
        try {
            const response = await axiosInstance.post("/auth/logIn",data);
            set({authUser:response.data});
            console.log(response.data.message);
            get().connectSocket();
            toast.success(response.data.message);
        } catch (error) {
            console.log("error in login!", error.message);
            toast.error(error.response.data.message);
        }finally{
            set({isLoggingIn:false});
        }
    },
    updateProfile: async(data) =>{
        set({isUpdateingProfile:true})
        try {
            const res = await axiosInstance.put("/auth/update-profile",data);
            toast.success(res.data.message);
        } catch (error) {
            console.log("error in updating profie!",error.message);
            toast.error(error.response.data.message)
        }finally{
            set({isUpdateingProfile:false});
        }
    },
    connectSocket: async() =>{
        const {authUser} = get();
        if(!authUser || get().socket?.connected) return ;

        //we passed the userId in socket using query and we can use it in backend
        const socket = io(BASE_URL,{
            query:{
                userId:authUser._id
            }
        });

        socket.connect();
        set({socket:socket})
        
        //set the online users array with received userids
        socket.on("getOnlineUsers",(userIds)=>{
           set({onlineUsers:userIds});
        })
    },
    disconnectSocket: () =>{
        if(get().socket?.connected) get().socket.disconnect();
        console.log("user disconnected!")
    },
    setSelectedUser:() =>{
        
    }
}))