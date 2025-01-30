
import { User } from '../../../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_PROFILE_IMAGE } from '../../../assets/images';


interface Props{
    user:User
}

const ProfileCard:React.FC<Props> = ({user})=>{
     const navigate = useNavigate()
    return(
        <div className="p-6 transition-all duration-300 bg-white shadow-md rounded-xl hover:shadow-lg">
        <div className="flex items-center space-x-4">
          <img 
            src={user.profileImage || DEFAULT_PROFILE_IMAGE} 
            alt={user.name} 
            className="object-cover w-16 h-16 rounded-full"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              {/* <MessageSquare className="w-4 h-4 mr-1" /> */}
              <span>{user.bio || "No bio available"}</span>
            </div>
            {/* <div className="flex items-center mt-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{user.location}</span>
            </div> */}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">{user.followersCount} connections</span>
          <button onClick={()=>navigate(`/profile/${user.user_name}`)} className="text-sm font-semibold text-purple-600 hover:text-purple-700">
            view
          </button>
        </div>
      </div>
    )
}

export default ProfileCard