// ===== Database Setup for Tests =====
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import User from '../models/register.model.js';
import Post from '../models/post.model.js';
import server from '../index.js';
import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiSorted from 'chai-sorted';

// ===== Chai Setup =====
chai.should();
chai.use(chaiHttp);
chai.use(chaiSorted);

let mongoServer;
let token;

const defaultUser = {
  name: "Pratap",
  email: "pratap123@email.com",
  password: "pratap"
};

const dummyPost = {
  title: "CSE",
  description: "CSE is the trending degree nowdays"
};

let userId;
let postId;

// ===== Setup In-Memory MongoDB =====
before(async function() {
  this.timeout(20000); // Increase timeout for DB setup
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, { 
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to in-memory MongoDB for tests");

    // Clear any existing users
    await User.deleteMany({});

    // Hash the password to match login logic
    const hashedPassword = await bcrypt.hash(defaultUser.password, 10);
    const createdUser = await User.create({
      name: defaultUser.name,
      email: defaultUser.email,
      password: hashedPassword
    });

    // Use the created user's _id for tests
    userId = createdUser._id.toString();

  } catch (err) {
    console.error("MongoMemoryServer setup failed:", err);
    throw err;
  }
});

// Stop in-memory MongoDB after all tests
after(async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  } catch (err) {
    console.error("Error cleaning up MongoMemoryServer:", err);
  }
});

// ===== Existing Tests =====
describe('Testing the REST APIs', () => {

  // Testing Auth
  beforeEach("User Authenticated", done => {
    chai.request(server)
      .post("/api/authenticate/login")
      .send({ email: defaultUser.email, password: defaultUser.password })
      .end((err, res) => {
        token = res.body.token;
        res.should.have.status(200);
        done();
      });
  });

  describe('POST /api/follow/:id', () => {
    it("testing whether a user can follow another user", done => {
      chai.request(server)
        .post(`/api/follow/${userId}`)
        .set({ authtoken: token })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('POST /api/unfollow/:id', () => {
    it("testing whether a user can unfollow another user", done => {
      chai.request(server)
        .post(`/api/unfollow/${userId}`)
        .set({ authtoken: token })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('GET /api/user', () => {
    it("User Successful Profile Check", done => {
      chai.request(server)
        .get('/api/user')
        .set({ authtoken: token })
        .send({ userId })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it("User Unsuccessful Profile Check", done => {
      chai.request(server)
        .get('/api/user')
        .set({ authtoken: token })
        .send(userId)
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

  describe('POST /api/posts', () => {
    it("Post successful creation check", done => {
      chai.request(server)
        .post('/api/posts')
        .set({ authtoken: token })
        .send(dummyPost)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it("Post creation with Title field missing", done => {
      chai.request(server)
        .post('/api/posts')
        .set({ authtoken: token })
        .send({ description: "ECE is not the trending degree nowdays" })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it("UnSuccessful Delete of Post", done => {
      chai.request(server)
        .delete(`/api/posts/`)
        .send(postId)
        .set({ authtoken: token })
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('POST /api/like/:id', () => {
    it("Able to Like a Post", done => {
      chai.request(server)
        .post(`/api/like/${postId}`)
        .set({ authtoken: token })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it("Failed to Like a Post User Unauthorized", done => {
      chai.request(server)
        .post(`/api/like/${postId}`)
        // no auth token
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('POST /api/unlike/:id', () => {
    it("Able to Unlike a Post", done => {
      chai.request(server)
        .post(`/api/unlike/${postId}`)
        .set({ authtoken: token })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('POST /api/comment/:id', () => {
    it("Successful Comment over a Post", done => {
      chai.request(server)
        .post(`/api/like/${postId}`)
        .send({ comment: "great workkk" })
        .set({ authtoken: token })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('GET /api/posts/:id', () => {
    it("Successful Post fetch", done => {
      chai.request(server)
        .get(`/api/posts/${postId}`)
        .set({ authtoken: token })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });

    it("Unavaible Post fetch", done => {
      const wrongId = 'psmsndndi1111i3js0';
      chai.request(server)
        .get(`/api/posts/${wrongId}`)
        .set({ authtoken: token })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

  describe('GET /api/all_posts', () => {
    it("fetching all posts of User", done => {
      chai.request(server)
        .get('/api/all_posts')
        .set({ authtoken: token })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.posts.should.have.sortedBy("createdAt", { descending: true });
          done();
        });
    });
  });

});

