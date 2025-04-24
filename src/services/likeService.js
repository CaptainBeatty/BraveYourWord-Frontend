import axios from './axios';
export async function vote(entity, id, action) {
  const { data } = await axios.post(`/${entity}/${id}/${action}`);
  return data; // { likes, dislikes }
}