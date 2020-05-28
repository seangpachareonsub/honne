### ![](https://ga-dash.s3.amazonaws.com/production/assets/logo-9f88ae6c9c3871690e33280fcf557f33.png) General Assembly, Software Engineering Immersive

## HONNE

### Overview

This is the final project of the Software Engineering bootcamp at GA London. The assignment was to create a full-stack application within one week, and I chose to take on the project solo. It allowed me to balance out my portfolio, having already developed two group projects but only one individually.

Honne is dating app that takes on a new approach and challenges the standard functionality of dating apps allowing users to connect on a deeper level. Users of the application are matched by answering a collection of questions set by other users and as a result, they can identify if their matches’ values and goals align with their own. All of this is achieved by using the Django REST framework with a PostgreSQL database and a React front-end.

You can launch the game on [Heroku](https://ga-honne.herokuapp.com/), or find the [GitHub repository](https://github.com/seangpachareonsub/honne).

**NOTE** 

If you would like to test the app, you can create your own account (the email address does not need to be real) or please feel free to use the following credentials for a demo account:

**Email:** test@test.com <br />
**Password:** Password2020

The app was designed with the consideration of a iPhone X layout. Therefore, please open the app either on an iPhone X or on Google Chrome Developer Tools under the iPhone X view.

#### Technical Requirements:
* Choose to work solo or in a team
* Build a full-stack application by making your own backend and your own front-end
* Use a Python Django API using Django REST Framework to serve your data from a Postgres database
* Consume your API with a separate front-end built with React
* Be a complete product which most likely means multiple relationships and CRUD functionality for at least a couple of models
* Implement thoughtful user stories/wireframes that are significant enough to help you know which features are core MVP and which you can cut
* Have a visually impressive design to kick your portfolio up a notch and have something to wow future clients & employers.
* Be deployed online so it's publicly accessible.

#### Technologies Used:
* JavaScript (ES6)
* React.js
* Python
* Django
* PostgreSQL
* HTML, JSX
* SCSS
* React Map GL
* Moment.js
* Heroku
* GreenSock Animation Platform
* Git and GitHub
* Google Fonts

## Approach

<img src='https://i.imgur.com/GC2yl5s.jpg'>

### Back-end:

#### Models and API endpoints
Within the PostgreSQL database, I created seven tables/models. 
  - IndividualPictures
  - UserPreferences
  - IndividualMessages
  - Messages
  - QuestionChoices
  - UserQuestions

The User model extends the `AbstractBaseUser` model which provided basic authentication functionality. I opted to use `AbstractBaseUser` over the standard `AbstractUser` because it allowed me to overwrite the initial 'USERNAME_FIELD' (unique identifier of each user). Django's default uses the username of a user as the 'USERNAME_FIELD' but this wasn't necessary for my application. Using `AbstractBaseUser` allowed me to assign the email address of each user as the 'USERNAME_FIELD'.

In extension to this, I added custom fields to my User model. A new user is created upon registration where a `POST` request is sent to the `/api/register` endpoint. Once a new user is created, all other information of a user such as D.O.B, sex etc. can be updated through a `PATCH` request to `/api/users/<int:pk>` endpoint.

```js
class User(AbstractBaseUser):
  USERNAME_FIELD = 'email'
  email = models.EmailField(max_length=100, unique=True)
  username = models.CharField(max_length=1, unique=False)
  first_name = models.CharField(max_length=30, unique=False)
  date_of_birth = models.DateField(null=True)
  sex = models.CharField(max_length=7)
  star_sign = models.CharField(max_length=20)
  latitude = models.CharField(max_length=40)
  longitude = models.CharField(max_length=40)
  occupation = models.CharField(max_length=50)
  bio = models.CharField(max_length=200)
  preferences = models.ForeignKey('UserPreferences', db_index=True, related_name='user', blank=True, null=True, on_delete=models.SET_NULL)
  conversations = models.ManyToManyField('Messages', db_index=True, related_name='user', blank=True)
  questions = models.ForeignKey('UserQuestions', related_name='user', null=True, on_delete=models.SET_NULL)
  matches = models.ManyToManyField('self', db_index=True, related_name='matches', blank=True)
  rejected =  models.ManyToManyField('self', db_index=True, related_name='rejects', blank=True)
  images = models.ManyToManyField('IndividualPictures', db_index=True, related_name='user', blank=True)  

  objects = UserManager()

  def __str__(self):
    return self.first_name
```

The IndividualPictues model and the endpoints leading to this model act as a central location for all photos uploaded onto the app regardless of the user. Django provides a `models.ImageField()` field option but I realised that assinging the User model a direct image field would mean that each user would be restricted to one image. Therefore, the uploading of images follows these steps:

* Uploading a photo is through a `POST` request to `/api/individualpictures`
* The owner field in the `IndividualPictures` model is a `model.ForeignKey` field which relates to the user uploading the photo. Using this, we can send a `PATCH` request to the specific user and modify the `models.ManyToMany` image field to include the primary key of the new image. The app allows for up to six photos per user.

``` js
class IndividualPictures(models.Model):
  owner = models.ForeignKey(User, related_name='pictures', null=True, on_delete=models.CASCADE)
  picture = models.ImageField(upload_to='images')

  def __str__(self):
    return str(self.owner)
``` 

Django allows us to specify an `upload_to` option for the picture field. This automatically creates an image folder within the root directory where all the photos are stored. In order to correctly serve images from Django, two configurations are needed:

* Inside the `settings.py` file, I've defined a `MEDIA_URL` which modifies the image file URL and a `MEDIA_ROOT` which provides the folder location where the images are kept in the app.

``` js
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(os.path.dirname(BASE_DIR), 'PEOPLE')
```
* Inside the `urls.py` file, I defined the url pattern which specifies the exact location to serve the image files from.

``` js
if settings.DEBUG:
  urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

I created a `UserPreferences` model which mimics the `IndividualPictures` model by means of acting as a central location for all match preferences for all users. By doing so, it allowed me to limit the number of fields on the User model and seperate potential conflicting fields i.e. the sex of the user vs the sex preference of their potential matches.

The way of assinging the user preferences to each user follows two steps:

* `POST` request sent to `/api/userpreferences` with new user preferences
* `PATCH` request to modify the `preferences` field of the specific user it relates to. Using the primary key of the user preference, we can assign it to the user.

``` js
class UserPreferences(models.Model):
  owner = models.ForeignKey(User, related_name='userpreferences', null=True, on_delete=models.CASCADE)
  distance = models.IntegerField()
  min_age = models.IntegerField()
  max_age = models.IntegerField()
  sex = models.CharField(max_length=7)

  def __str__(self):
    return str(self.owner)
```

The `IndividualMessages` and `Messages` models go hand in hand to create conversations between users on the app. When a new match occurs between two users, a conversation is immediately created for them. This is achieved through two requests:

* `POST` request to `/api/messages` endpoint which includes both user's primary keys and an initial empty messages field. The messages field is a `models.ManyToMany` field drawing data from the `IndividualMessages` model.
* `PATCH` request sent to both users using the `/api/users/<int:pk>` endpoint to update their conversations field to include the new conversation

``` js
class Messages(models.Model):
  user_one = models.ForeignKey(User, related_name='number_one', on_delete=models.CASCADE)
  user_two = models.ForeignKey(User, related_name='number_two', on_delete=models.CASCADE)
  messages = models.ManyToManyField(IndividualMessages, related_name='individuals', db_index=True, blank=True)

  def __str__(self):
    return f'{self.user_one} & {self.user_two}'
```

When users conversate, all messages on the app are stored inside the `IndividualMessages` table. Each data row in the table includes the primary keys of both users in the conversation, the message string sent and the time/date of the message. Each individual message gets assigned to their respected conversation similar to each user preference being assigned to the specific user it relates to.

* `POST` request sent to `/api/individualmessages` which is where all messages on the app are stored
* `PATCH` request sent to `/api/messages/<int:pk>` to update the conversation with the primary key of the new message

``` js
class IndividualMessages(models.Model):
  sent_from = models.ForeignKey(User, related_name='messages', on_delete=models.CASCADE)
  sent_to = models.ForeignKey(User, related_name='texts', on_delete=models.CASCADE)
  string = models.CharField(max_length=1000)
  created_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f'{self.sent_from} & {self.sent_to}'
``` 

The uniqueness of the app surrounds the collection of questions that are set and answered by users. The app provides a selection of 16 predefined questions (8 questions based on values and 8 based on preferences), of which users select 6 (three from each category).

The `QuestionChoices` table includes all the questions that are available to the users to be selected. It includes three fields:

* Choice field which is the question itself
* Category field, whether it is a question based on values or preferences
* Option field holds the two possible answers to the question

``` js
class QuestionChoices(models.Model):
  choice = models.CharField(max_length=1000)
  category = models.CharField(null=True, max_length=30)
  options = models.CharField(null=True, max_length=100)

  def __str__(self):
    return self.choice
```

Once a user selects their collection of 6 questions during the initial setup, the next phases follow:

* `POST` request sent to `/api/userquestions` endpoint. The `UserQuestions` table holds all the question selections of all users on the app. 
* Users themselves need to answer the question they've selected and once this happens, a `PATCH` request is sent to `/api/userquestions/<int:pk>` modifying the data row to include the answers they've given.
* That specific primary key for the user question data row is used in order to assign it to the correct user through another `PATCH` request to `/api/users/<int:pk>` modifying their questions field.

``` js
class UserQuestions(models.Model):
  owner = models.ForeignKey(User, null=True, related_name='choices', on_delete=models.CASCADE)
  questions = models.ManyToManyField(QuestionChoices, related_name='userquestions', db_index=True, blank=True)
  answers = models.CharField(max_length=1000, blank=True)

  def __str__(self):
    return str(self.owner)
```

### Front-end:

#### Main and sub pages that I decided to feature on the app:
* Homepage with login and register options
* Login & register page
* Initial set up page (location, sex, D.O.B, question selections)
* User profile page with three subpages: 
  - User settings/preferences page
  - Media page to add photos to profile
  - Bio page for users to write about themselves
* Swipe page, users answer others questions and see if they match or not
* Message page, displays conversation list and recent matches
* Private conversation page to talk to other users
* Explore page allowing users to see who is around them
* Two modal pop ups, one for when matching with someone new and another for account deletion

The application's main colour palette is a mixture of off-white and purple. The aim was to keep the design to a minimum and using off-white gave the impression of a clean and sleek look. The purple gave a contrast towards the overall design and is often associated with nobility, ambition and peace.

There are four main pages of the application, all of which are accessible through the navigation bar. 

#### Swipe page

The app runs on the concept that users are matched based on how many answers are correctly given to another's collection of questions. With this in mind, the concept adds a gaming element to the functionality. Users are able to immediately gauge a sense of other user's personality while keeping the standard aspects of dating apps i.e. picture, star sign, distance and age being shown.

The swipe page is split into a number of different steps: 

* Within the `useEffect` of the component a `GET` request is sent to `/api/users` which returns the all users on the app. I then proceed to filter out the users based on the current user's preferences.

``` js
axios.get('/api/users')
  .then(res => {
    let user = null
    res.data.map(el => {
      if (el.id === auth.getUserId()) {
        user = el
        setUser(el)
      }
    })

const filter = res.data.filter(el => {
const uSex = user.preferences.sex
const min = user.preferences.min_age
const max = user.preferences.max_age
const age = moment().diff(el.date_of_birth, 'years')
const dis = getDistance(user.latitude, user.longitude, el.latitude, el.longitude)
const rejected = user.rejected.map(el => el.id)
const matched = user.matches.map(el => el.id)
   
  if (uSex === 'both') {
    return age >= min && age <= max &&
      dis <= user.preferences.distance &&
      !rejected.includes(el.id) &&
      !matched.includes(el.id) &&
      el.id !== user.id ? el : null
  } else {
    return el.sex === uSex &&
      age >= min && age <= max &&
      dis <= user.preferences.distance &&
      !rejected.includes(el.id) &&
      !matched.includes(el.id) &&
      el.id !== user.id ? el : null
  }
})
setPotentials(filter)
``` 

`getDistance()` is a function that calculates the distance between two longitudes and latitudes.

```js
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 
  const dLat = deg2rad(lat2 - lat1)  
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d.toFixed()
}

const deg2rad = (deg) => {
  return deg * (Math.PI / 180)
}
```

Once the current user has given their answers and now wants to compare if theirs match those of the person who initially set the questions, the matching function can be broken down as such:

The first step does the following:
* Ensures that all 6 questions are answered by the current user
* Sends a `GET` request to `/api/userquestions` where the response is the answers of the user who initially set the questions 
* Compares the current user's answers against the potential matches' answers

``` js
if (userAnswers.split(',').length !== 6) {
  return
} else {
  axios.get(`/api/userquestions/${arr.shift()}/`)
    .then(res => {
      cardAns = res.data.answers.split(',')
      cardAns.map((el, i) => {
        el.replace(/ /g, '') === userAns[i] ? correctAnswers += 1 : null
      })
```

If 4+ questions are correctly answered then a match is created between the two users and the following happens:

* Send `PATCH` request to `/api/users/<int:pk>` to update and modify both users' matches field to include one another.

``` js
if (correctAnswers >= 4) {
   ToggleModal()
   const current = user.matches.map(el => el.id)
   const updateMatch = current.concat(res.data.owner)
   axios.patch(`/api/users/${auth.getUserId()}/`, { matches: updateMatch })
```

* Within the promise of the API request, a new conversation is created immediately for the users and a `POST` request is sent to `/api/messages`

``` js
.then(res => {
  const newConvo = {
    user_one: res.data.id,
    user_two: updateMatch.pop(),
    messages: []
  }
  axios.post('/api/messages/', newConvo)
```

* Inside a nested promise, I've then proceeded to update both users conversation field to now include the newly created conversation using it's primary key in the response from the `POST` request.

``` js
.then(res => {
const arr = []
const newConvoId = res.data.id
arr.push(res.data.user_one)
arr.push(res.data.user_two)

arr.map(el => {
  axios.get(`/api/users/${el}/`)
    .then(res => {
      const currentConvos = res.data.conversations.map(el => el.id)
      const updateConvos = currentConvos.concat(newConvoId)

      axios.patch(`/api/users/${el}/`, { conversations: updateConvos })
    })
  })
})
```

When a user has not answered enough questions correctly, I've used GreenSock animation platform for page to transition to the next card for the next set of questions.

``` js
else {
  const t1 = new TimelineLite
  const width = container.current.clientWidth
  buttons.current.innerHTML = 'Ahhhh it\'s not a match we\'re afraid!'

  setTimeout(() => {
    t1.to((container.current, buttons.current), 0.15, { filter: 'blur(6px)', opacity: 0 })
      .to('.question-slideshow', 0.1, { transform: 'translateY(0px)', transition: 'none' })
      .to(container.current, 0.1, { transform: `translateX(-${width * count}px)` }, '+=0.31')
      .to(buttons.current, 0.1, { width: '20%' }, '-=0.3')
      .to((container.current, buttons.current), 0.1, { filter: 'blur(0)', opacity: 1 }, '+=0.30')
      .to('#hide', 0.1, { display: 'block' })
  }, 1000)
}
```

#### Message page 

The second main component of the app is the message page which displays the current user's most recent matches as as well as their conversations with the most recent conversations at the top of the list.

I've used the array `sort()` method with my own comparison function inside the method itself to compare between message ids. The higher the id, means the more recent the message.

``` js
useEffect(() => {
  axios.get(`/api/users/${auth.getUserId()}`)
    .then(res => {
      setMatches(res.data.matches.reverse())
      const sorted = res.data.conversations.sort((a, b) => {
        if (a.messages.length && b.messages.length) {
          if ((a.messages[a.messages.length - 1].id) >
              (b.messages[b.messages.length - 1].id)) {
              return -1
            } else {
              return 1
            }
          } else {
            return -1
          }
        })
        setConvos(sorted)
      })
  }, [])
```

Clicking on the names of the users most recent matches re-directs them to their matches profile page and alternatively, clicking on a conversation directs them to the chat page.


#### Explore page

The explore page of the application utilises React Map GL and features the locations of nearby users. The purpose of this page was to allow users to gauge their surroundings and encourage them answer questions if there were users around.

The `viewport` state initialises the map once the component mounts and focuses the map on the current user's location using their longitude and latitude.

``` js
 const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 13,
    width: 375,
    height: 525
  })

useEffect(() => {
  axios.get('/api/users/')
    .then(res => {
      res.data.map(el => {
        if (el.id === auth.getUserId()) {
          setUser(el)
          setViewport({ ...viewport, latitude: parseFloat(el.latitude), 
          longitude:parseFloat(el.longitude) })
        } 
      })
    })
  }, [])
```

I've then mapped through all the users on the app and have visually plotted a 'pin' icon of their location on the map. To distinguish between the current user and other users, the current is represented by a red pin and the others are represented by a blue pin.

``` js
{markers.map(el => {
  if (el.id !== auth.getUserId()) {
    return (
      <Marker key={el.id} 
        latitude={parseFloat(el.latitude)} 
        anchor={'top-left'}
        offsetLeft={-20}
        offsetTop={-30}
        longitude={parseFloat(el.longitude)} >
        
        <div className='other-marker'>
          <ion-icon onClick={() => { setSelected(el) }} name='pin-outline'></ion-icon>
        </div>
      </Marker>
    )
  } else {
      return (
        <Marker key={user.id} 
          anchor={'top-left'}
          offsetLeft={-20}
          offsetTop={-30}
          latitude={parseFloat(el.latitude)}
          longitude={parseFloat(el.longitude)} >
            
          <div className='user-marker'>
            <ion-icon name="pin-outline"></ion-icon>
          </div>
        </Marker>
      )
    }
})}
```

#### Profile page

Like any profile page, it serves to allow users to control their presence on the application. The app directs them to three sub pages to do so:

* Images page
* Preferences page
* Account preview (bio) page

The media page allows for up to 6 photos and once the component mounts, the code looks to work out how many picture slots are available for an upload and how many are taken. The `updateUser()` function is called multiple times i.e. on component mount, photo upload and photo deletion. The main purpose of the function is to rerender the page by updating the `emptySlots` state.

``` js
const updateUser = () => {
  axios.get(`/api/users/${auth.getUserId()}`)
    .then(res => {
      setUser(res.data)
      const slotNumbers = []
      for (let i = 0; i < 6 - res.data.images.length; i++) {
        slotNumbers.push(1)
      }
      setEmptySlots(slotNumbers)
  })
}

useEffect(() => updateUser(), [])
```

The input element has an inline style of `display: none` and the upload icon takes the functionality of the input within an `onClick` event. The `HandleFile()` function updates the `useRef` current element and uses the input element's functionality.

Empty photo slots which are available for upload have the following structure:

``` js
const input = useRef()

const HandleFile = (e) => {
  input.current = e.target.previousSibling
  input.current.click()
}

{emptySlots.map((el, i) => {
  return (
    <div key={i} className="input-container">
      <input style={{ display: 'none' }} onChange={(e) => HandleChange(e)} type="file" />
      <ion-icon onClick={(e) => HandleFile(e)} name="add-circle"></ion-icon>
    </div>
  )
})}
```

### Screenshots

<img src='https://i.imgur.com/p8cHmyh.png'>
<img src='https://i.imgur.com/CbcPEed.png'>
<img src='https://i.imgur.com/LJytksC.png'>


### Bugs
During the development phase, the app functions properly and to it's full extent. However, there were issues that had arisen post deployment:

* Heroku does not support image files and therefore, images on the deployed version of the application do not work. This includes the uploading of photos as well as profile pictures across the app.
* The app is only featured and is accessible through a web browser meaning that the layout causes unnecessary scrolling. This issue would not occur if the site was an actual phone application because the layout takes up the entire phone height and width.
* The soft keyboard on Android pushes the content and squeezes the content to 40% screen height and causes the design of the app to be squashed.
* Due to time constraints, I was only able to develop the site on the iPhone X screen size and therefore, on any other mobile/desktop screen size, the app does not function properly.
* The chat feature is not live, the page must re-render for new messages to come through

### Potential future features and improvements

* Serve images through Amazon S3 bucket where image files can be stored
* Design the layout of the app with other mobile screens in mind where the design can be as adaptable as possible using relative units rather than fixed styling
* Incorporate actual swipe touch to the page when disliking a user.
* Introduce websockets to the chat feature to create live communication channels between users
* Establish the app on the IOS and Google app store, since the design and layout was made for full screen phone width and height in mind.

