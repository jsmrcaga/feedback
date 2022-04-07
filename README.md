# feedback

Feedback is a simple feedback collector API.

I built it to try my hand at "manual" GraphQL, but can be very easily deployed to Cloudflare Workers and modified
to work with a real authentication & storage system.

The API itself is a GraphQL collection of query and mutations that allow:
- to signup
- to login
- to create feedback for another user
- to retrieve another user (by default everything is public)
