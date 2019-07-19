
import { dockerHost } from '../ports';

export const apiCall = (method, endpoint, headers, body) => {
	return fetch(`${dockerHost}/${endpoint}`, {
		body: body,
		method: method,
		headers: headers
	})
	.then(resp => resp.json())
	.catch(err => err);
}