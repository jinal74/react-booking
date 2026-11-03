import axios from '../libs/axios';

export function GetApi(path) {
    const GetApiData = axios
        .get(path)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error.response;
        });
    return GetApiData;
}

// export async function PostApi(path, body) {
//     try {
//         const { data } = await axios.post(path, body);
//         if (data !== null) {
//             return data;
//         }
//         return null;
//     } catch (error) {
//         if (error.message) return error;
//         throw error;
//     }
// }

export async function PostApi(path, body) {
    try {
        let company_id = "30623831643164332D363938322D3131";
        const isLoggedIn = !!localStorage.getItem('token_auth');

        if (!isLoggedIn) {
            body = { ...body, company_id: company_id };
        }

        const { data } = await axios.post(path, body);
        if (data !== null) {
            return data;
        }
        return null;
    } catch (error) {
        if (error.message) return error;
        throw error;
    }
}
