# OTTER Event API — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Ruby on Rails 7 JSON API backend for the OTTER event management app, serving all data to the Next.js frontend.

**Architecture:** Rails 7 in API mode with MySQL, JWT authentication via `Authorization: Bearer` header, and an OpenAPI 3.0 spec at `docs/openapi.yaml`. All controllers render JSON. The frontend lives in a separate repo at `http://localhost:3000`.

**Tech Stack:** Ruby 3.2, Rails 7.1, MySQL 8, `jwt` gem, `bcrypt` (has_secure_password), `rack-cors`, `rspec-rails`, `factory_bot_rails`, `shoulda-matchers`, `faker`

---

## File Map

```
otter-event-api/
├── app/
│   ├── controllers/
│   │   ├── application_controller.rb      ← JWT auth, error handlers
│   │   ├── auth_controller.rb             ← signup/login/logout
│   │   ├── events_controller.rb           ← events CRUD
│   │   ├── event_participants_controller.rb
│   │   ├── expenses_controller.rb
│   │   ├── ingredients_controller.rb
│   │   ├── photos_controller.rb
│   │   ├── ratings_controller.rb
│   │   ├── recipes_controller.rb
│   │   ├── users/
│   │   │   └── me_controller.rb           ← GET/PATCH current user
│   │   └── discover/
│   │       ├── rankings_controller.rb
│   │       ├── challenges_controller.rb
│   │       └── contest_controller.rb
│   ├── errors/
│   │   └── authentication_error.rb
│   ├── models/
│   │   ├── user.rb
│   │   ├── event.rb
│   │   ├── event_participant.rb
│   │   ├── expense.rb
│   │   ├── ingredient.rb
│   │   ├── photo.rb
│   │   ├── rating.rb
│   │   └── recipe.rb
│   └── services/
│       └── jwt_service.rb
├── config/
│   ├── routes.rb
│   ├── database.yml
│   └── initializers/cors.rb
├── db/migrate/
│   └── (migration files per task)
├── docs/
│   └── openapi.yaml
└── spec/
    ├── factories/
    ├── models/
    ├── requests/
    ├── services/
    └── support/auth_helpers.rb
```

---

### Task 1: Project Setup

**Files:**
- Create: `Gemfile`
- Create: `config/database.yml`
- Create: `config/initializers/cors.rb`

- [ ] **Step 1: Create new Rails API project**

```bash
rails new otter-event-api --api --database=mysql
cd otter-event-api
```

Expected: New Rails project created with API-only configuration.

- [ ] **Step 2: Replace Gemfile content**

```ruby
# Gemfile
source "https://rubygems.org"

gem "rails", "~> 7.1"
gem "mysql2", "~> 0.5"
gem "puma", ">= 5.0"
gem "bootsnap", require: false
gem "tzinfo-data", platforms: %i[windows jruby]
gem "rack-cors"
gem "jwt", "~> 2.7"
gem "bcrypt", "~> 3.1"

group :development, :test do
  gem "debug", platforms: %i[mri windows]
  gem "rspec-rails", "~> 6.1"
  gem "factory_bot_rails"
  gem "faker"
end

group :test do
  gem "shoulda-matchers", "~> 5.0"
end
```

- [ ] **Step 3: Install gems**

```bash
bundle install
```

Expected: All gems installed successfully.

- [ ] **Step 4: Configure database**

```yaml
# config/database.yml
default: &default
  adapter: mysql2
  encoding: utf8mb4
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  username: <%= ENV.fetch("DB_USERNAME") { "root" } %>
  password: <%= ENV.fetch("DB_PASSWORD") { "" } %>
  host: <%= ENV.fetch("DB_HOST") { "localhost" } %>

development:
  <<: *default
  database: otter_event_api_development

test:
  <<: *default
  database: otter_event_api_test

production:
  <<: *default
  database: otter_event_api_production
  username: <%= ENV["DB_USERNAME"] %>
  password: <%= ENV["DB_PASSWORD"] %>
```

- [ ] **Step 5: Configure CORS**

```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("FRONTEND_URL") { "http://localhost:3000" }
    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: false
  end
end
```

- [ ] **Step 6: Create databases and install RSpec**

```bash
rails db:create
rails generate rspec:install
```

Expected: Databases `otter_event_api_development` and `otter_event_api_test` created.

- [ ] **Step 7: Configure RSpec support**

Add to `spec/rails_helper.rb` inside `RSpec.configure` block:

```ruby
# spec/rails_helper.rb  (add to existing file)
RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods
end

Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
```

Add above `RSpec.configure`:
```ruby
Dir[Rails.root.join("spec", "support", "**", "*.rb")].sort.each { |f| require f }
```

Create auth helper:
```ruby
# spec/support/auth_helpers.rb
module AuthHelpers
  def auth_headers(user)
    token = JwtService.encode(user_id: user.id)
    { "Authorization" => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :request
end
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "chore: initialize Rails 7 API project with MySQL and RSpec"
```

---

### Task 2: JwtService + ApplicationController

**Files:**
- Create: `app/errors/authentication_error.rb`
- Create: `app/services/jwt_service.rb`
- Modify: `app/controllers/application_controller.rb`
- Create: `spec/services/jwt_service_spec.rb`

- [ ] **Step 1: Write failing JWT service spec**

```ruby
# spec/services/jwt_service_spec.rb
require "rails_helper"

RSpec.describe JwtService do
  let(:payload) { { user_id: 42 } }

  describe ".encode" do
    it "returns a three-part JWT string" do
      token = JwtService.encode(payload)
      expect(token).to be_a(String)
      expect(token.split(".").length).to eq(3)
    end
  end

  describe ".decode" do
    it "returns the original payload" do
      token = JwtService.encode(payload)
      decoded = JwtService.decode(token)
      expect(decoded[:user_id]).to eq(42)
    end

    it "raises AuthenticationError for a tampered token" do
      expect { JwtService.decode("bad.token.here") }.to raise_error(AuthenticationError)
    end
  end
end
```

- [ ] **Step 2: Run to verify failure**

```bash
bundle exec rspec spec/services/jwt_service_spec.rb
```

Expected: FAIL — `JwtService` uninitialized.

- [ ] **Step 3: Implement error class, JwtService, and ApplicationController**

```ruby
# app/errors/authentication_error.rb
class AuthenticationError < StandardError; end
```

```ruby
# app/services/jwt_service.rb
class JwtService
  EXPIRY = 24 * 60 * 60 # seconds

  def self.encode(payload)
    payload = payload.merge(exp: Time.now.to_i + EXPIRY)
    JWT.encode(payload, secret, "HS256")
  end

  def self.decode(token)
    decoded = JWT.decode(token, secret, true, algorithm: "HS256")
    HashWithIndifferentAccess.new(decoded.first)
  rescue JWT::ExpiredSignature
    raise AuthenticationError, "Token has expired"
  rescue JWT::DecodeError => e
    raise AuthenticationError, e.message
  end

  def self.secret
    Rails.application.secret_key_base
  end
  private_class_method :secret
end
```

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  before_action :authenticate_user!

  rescue_from AuthenticationError,          with: :render_unauthorized
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

  private

  def authenticate_user!
    token = request.headers["Authorization"]&.split(" ")&.last
    raise AuthenticationError, "Missing token" unless token

    payload = JwtService.decode(token)
    @current_user = User.find(payload[:user_id])
  end

  def current_user
    @current_user
  end

  def render_unauthorized(error)
    render json: { error: error.message }, status: :unauthorized
  end

  def render_not_found(error)
    render json: { error: error.message }, status: :not_found
  end
end
```

- [ ] **Step 4: Run tests**

```bash
bundle exec rspec spec/services/jwt_service_spec.rb
```

Expected: 3 examples, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add app/errors/ app/services/ app/controllers/application_controller.rb spec/
git commit -m "feat: add JwtService and ApplicationController auth"
```

---

### Task 3: User Model

**Files:**
- Create: `db/migrate/TIMESTAMP_create_users.rb`
- Create: `app/models/user.rb`
- Create: `spec/models/user_spec.rb`
- Create: `spec/factories/users.rb`

- [ ] **Step 1: Write failing model spec**

```ruby
# spec/models/user_spec.rb
require "rails_helper"

RSpec.describe User, type: :model do
  subject { build(:user) }

  it { should validate_presence_of(:name) }
  it { should validate_presence_of(:email) }
  it { should validate_uniqueness_of(:email).case_insensitive }

  it { should have_many(:organized_events).class_name("Event") }
  it { should have_many(:event_participants) }
  it { should have_many(:events).through(:event_participants) }
  it { should have_many(:ratings) }

  describe "#authenticate" do
    it "returns the user when password matches" do
      user = create(:user, password: "password123")
      expect(user.authenticate("password123")).to eq(user)
    end

    it "returns false for a wrong password" do
      user = create(:user, password: "password123")
      expect(user.authenticate("wrong")).to be_falsy
    end
  end
end
```

- [ ] **Step 2: Run to verify failure**

```bash
bundle exec rspec spec/models/user_spec.rb
```

Expected: FAIL — `User` model undefined.

- [ ] **Step 3: Generate migration**

```bash
rails generate migration CreateUsers name:string email:string password_digest:string avatar_url:string
```

Edit the generated file to add constraints:

```ruby
# db/migrate/TIMESTAMP_create_users.rb
class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :name,            null: false
      t.string :email,           null: false
      t.string :password_digest, null: false
      t.string :avatar_url

      t.timestamps
    end
    add_index :users, :email, unique: true
  end
end
```

```bash
rails db:migrate
```

- [ ] **Step 4: Implement model and factory**

```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_secure_password

  has_many :organized_events,  class_name: "Event", foreign_key: :organizer_id, dependent: :destroy
  has_many :event_participants, dependent: :destroy
  has_many :events,            through: :event_participants
  has_many :expenses,          foreign_key: :payer_id,    dependent: :destroy
  has_many :photos,            foreign_key: :uploader_id, dependent: :destroy
  has_many :ratings,           dependent: :destroy

  validates :name,  presence: true
  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
end
```

```ruby
# spec/factories/users.rb
FactoryBot.define do
  factory :user do
    name     { Faker::Name.full_name }
    email    { Faker::Internet.unique.email }
    password { "password123" }
    avatar_url { nil }
  end
end
```

- [ ] **Step 5: Run tests**

```bash
bundle exec rspec spec/models/user_spec.rb
```

Expected: All examples pass.

- [ ] **Step 6: Commit**

```bash
git add db/migrate/ app/models/user.rb spec/models/user_spec.rb spec/factories/users.rb
git commit -m "feat: add User model with has_secure_password"
```

---

### Task 4: Auth Endpoints

**Files:**
- Create: `app/controllers/auth_controller.rb`
- Modify: `config/routes.rb`
- Create: `spec/requests/auth_spec.rb`

- [ ] **Step 1: Write failing request spec**

```ruby
# spec/requests/auth_spec.rb
require "rails_helper"

RSpec.describe "Auth", type: :request do
  describe "POST /auth/signup" do
    it "creates a user and returns a JWT" do
      post "/auth/signup",
           params: { user: { name: "Taro", email: "taro@example.com", password: "password123" } },
           as: :json
      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body["token"]).to be_present
      expect(body["user"]["email"]).to eq("taro@example.com")
    end

    it "returns 422 for invalid params" do
      post "/auth/signup",
           params: { user: { name: "", email: "bad", password: "123" } },
           as: :json
      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["errors"]).to be_an(Array)
    end
  end

  describe "POST /auth/login" do
    let!(:user) { create(:user, email: "taro@example.com", password: "password123") }

    it "returns a JWT for valid credentials" do
      post "/auth/login",
           params: { email: "taro@example.com", password: "password123" },
           as: :json
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["token"]).to be_present
    end

    it "returns 401 for wrong password" do
      post "/auth/login",
           params: { email: "taro@example.com", password: "wrong" },
           as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /auth/logout" do
    it "returns 200 with a valid token" do
      user = create(:user)
      delete "/auth/logout", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
    end
  end
end
```

- [ ] **Step 2: Run to verify failure**

```bash
bundle exec rspec spec/requests/auth_spec.rb
```

Expected: FAIL — no route matches.

- [ ] **Step 3: Add routes**

```ruby
# config/routes.rb
Rails.application.routes.draw do
  post   "/auth/signup",  to: "auth#signup"
  post   "/auth/login",   to: "auth#login"
  delete "/auth/logout",  to: "auth#logout"
end
```

- [ ] **Step 4: Implement AuthController**

```ruby
# app/controllers/auth_controller.rb
class AuthController < ApplicationController
  skip_before_action :authenticate_user!, only: [:signup, :login]

  def signup
    user = User.new(signup_params)
    if user.save
      token = JwtService.encode(user_id: user.id)
      render json: { token: token, user: user_json(user) }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def login
    user = User.find_by(email: params[:email])
    if user&.authenticate(params[:password])
      token = JwtService.encode(user_id: user.id)
      render json: { token: token, user: user_json(user) }
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def logout
    render json: { message: "Logged out successfully" }
  end

  private

  def signup_params
    params.require(:user).permit(:name, :email, :password)
  end

  def user_json(user)
    { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url }
  end
end
```

- [ ] **Step 5: Run tests**

```bash
bundle exec rspec spec/requests/auth_spec.rb
```

Expected: 5 examples, 0 failures.

- [ ] **Step 6: Commit**

```bash
git add app/controllers/auth_controller.rb config/routes.rb spec/requests/auth_spec.rb
git commit -m "feat: add auth endpoints (signup/login/logout)"
```

---

### Task 5: Event Model + CRUD

**Files:**
- Create: `db/migrate/TIMESTAMP_create_events.rb`
- Create: `app/models/event.rb`
- Create: `app/controllers/events_controller.rb`
- Create: `spec/models/event_spec.rb`
- Create: `spec/factories/events.rb`
- Create: `spec/requests/events_spec.rb`

- [ ] **Step 1: Write failing specs**

```ruby
# spec/models/event_spec.rb
require "rails_helper"

RSpec.describe Event, type: :model do
  it { should belong_to(:organizer).class_name("User") }
  it { should have_many(:event_participants) }
  it { should have_many(:participants).through(:event_participants) }
  it { should have_many(:expenses) }
  it { should have_many(:ingredients) }
  it { should have_many(:photos) }
  it { should have_many(:ratings) }
  it { should validate_presence_of(:name) }
  it { should validate_presence_of(:date) }
  it { should define_enum_for(:event_type).with_values(drinking: 0, bbq: 1, cooking: 2, other: 3) }

  describe "scopes" do
    let!(:upcoming) { create(:event, date: Date.tomorrow) }
    let!(:past)     { create(:event, date: Date.yesterday) }

    it "upcoming returns future events" do
      expect(Event.upcoming).to include(upcoming)
      expect(Event.upcoming).not_to include(past)
    end

    it "past returns past events" do
      expect(Event.past).to include(past)
      expect(Event.past).not_to include(upcoming)
    end
  end
end
```

```ruby
# spec/requests/events_spec.rb
require "rails_helper"

RSpec.describe "Events", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers(user) }

  describe "GET /events" do
    before { create_list(:event, 3, organizer: user, date: Date.tomorrow) }

    it "returns upcoming events" do
      get "/events", params: { filter: "upcoming" }, headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["events"].length).to eq(3)
    end
  end

  describe "POST /events" do
    it "creates an event" do
      post "/events",
           params: { event: { name: "研究室BBQ", event_type: "bbq",
                              date: Date.tomorrow.to_s, time: "12:00",
                              location: "大学グラウンド" } },
           headers: headers, as: :json
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)["event"]["name"]).to eq("研究室BBQ")
    end
  end

  describe "GET /events/:id" do
    let(:event) { create(:event, organizer: user) }

    it "returns the event" do
      get "/events/#{event.id}", headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["event"]["id"]).to eq(event.id)
    end
  end

  describe "PATCH /events/:id" do
    let(:event) { create(:event, organizer: user, name: "Old") }

    it "updates the event name" do
      patch "/events/#{event.id}",
            params: { event: { name: "New" } },
            headers: headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["event"]["name"]).to eq("New")
    end
  end

  describe "DELETE /events/:id" do
    let(:event) { create(:event, organizer: user) }

    it "deletes the event" do
      delete "/events/#{event.id}", headers: headers
      expect(response).to have_http_status(:no_content)
    end
  end
end
```

- [ ] **Step 2: Run to verify failure**

```bash
bundle exec rspec spec/models/event_spec.rb spec/requests/events_spec.rb
```

Expected: FAIL.

- [ ] **Step 3: Migration**

```bash
rails generate migration CreateEvents name:string event_type:integer date:date time:time location:string organizer_id:integer
```

```ruby
# db/migrate/TIMESTAMP_create_events.rb
class CreateEvents < ActiveRecord::Migration[7.1]
  def change
    create_table :events do |t|
      t.string  :name,       null: false
      t.integer :event_type, null: false, default: 0
      t.date    :date,       null: false
      t.time    :time
      t.string  :location
      t.references :organizer, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end
```

```bash
rails db:migrate
```

- [ ] **Step 4: Model, factory, controller, routes**

```ruby
# app/models/event.rb
class Event < ApplicationRecord
  belongs_to :organizer, class_name: "User", foreign_key: :organizer_id
  has_many :event_participants, dependent: :destroy
  has_many :participants, through: :event_participants, source: :user
  has_many :expenses,    dependent: :destroy
  has_many :ingredients, dependent: :destroy
  has_many :photos,      dependent: :destroy
  has_many :ratings,     dependent: :destroy

  enum :event_type, { drinking: 0, bbq: 1, cooking: 2, other: 3 }

  validates :name,       presence: true
  validates :event_type, presence: true
  validates :date,       presence: true

  scope :upcoming, -> { where("date >= ?", Date.today).order(:date) }
  scope :past,     -> { where("date < ?",  Date.today).order(date: :desc) }
end
```

```ruby
# spec/factories/events.rb
FactoryBot.define do
  factory :event do
    association :organizer, factory: :user
    name       { Faker::Lorem.words(number: 3).join(" ") }
    event_type { :drinking }
    date       { Faker::Date.forward(days: 30) }
    time       { "18:00" }
    location   { Faker::Address.city }
  end
end
```

```ruby
# app/controllers/events_controller.rb
class EventsController < ApplicationController
  before_action :set_event, only: [:show, :update, :destroy]

  def index
    events = params[:filter] == "past" ? Event.past : Event.upcoming
    render json: { events: events.map { |e| event_json(e) } }
  end

  def show
    render json: { event: event_json(@event) }
  end

  def create
    event = Event.new(event_params.merge(organizer: current_user))
    if event.save
      render json: { event: event_json(event) }, status: :created
    else
      render json: { errors: event.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @event.update(event_params)
      render json: { event: event_json(@event) }
    else
      render json: { errors: @event.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @event.destroy
    head :no_content
  end

  private

  def set_event = @event = Event.find(params[:id])

  def event_params
    params.require(:event).permit(:name, :event_type, :date, :time, :location)
  end

  def event_json(event)
    {
      id: event.id, name: event.name, event_type: event.event_type,
      date: event.date, time: event.time, location: event.location,
      organizer: { id: event.organizer.id, name: event.organizer.name },
      participant_count: event.event_participants.count,
      created_at: event.created_at
    }
  end
end
```

Update routes:
```ruby
# config/routes.rb
Rails.application.routes.draw do
  post   "/auth/signup",  to: "auth#signup"
  post   "/auth/login",   to: "auth#login"
  delete "/auth/logout",  to: "auth#logout"

  resources :events
end
```

- [ ] **Step 5: Run tests**

```bash
bundle exec rspec spec/models/event_spec.rb spec/requests/events_spec.rb
```

Expected: All pass.

- [ ] **Step 6: Commit**

```bash
git add db/migrate/ app/models/event.rb app/controllers/events_controller.rb spec/ config/routes.rb
git commit -m "feat: add Event model and CRUD endpoints"
```

---

### Task 6: Event Sub-resource Models + Controllers

**Files:**
- Create: `db/migrate/` — 5 migration files
- Create: `app/models/` — event_participant, expense, ingredient, photo, rating
- Create: `app/controllers/` — 5 controllers
- Modify: `config/routes.rb`
- Create: `spec/factories/` — 5 factories
- Create: `spec/requests/event_participants_spec.rb`

- [ ] **Step 1: Write failing spec for participants**

```ruby
# spec/requests/event_participants_spec.rb
require "rails_helper"

RSpec.describe "EventParticipants", type: :request do
  let(:organizer)   { create(:user) }
  let(:participant) { create(:user) }
  let(:event)       { create(:event, organizer: organizer) }
  let(:headers)     { auth_headers(organizer) }

  describe "GET /events/:event_id/participants" do
    before { EventParticipant.create!(event: event, user: participant) }

    it "returns all participants" do
      get "/events/#{event.id}/participants", headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["participants"].length).to eq(1)
    end
  end

  describe "POST /events/:event_id/participants" do
    it "adds a participant" do
      post "/events/#{event.id}/participants",
           params: { user_id: participant.id },
           headers: headers, as: :json
      expect(response).to have_http_status(:created)
    end
  end
end
```

- [ ] **Step 2: Run to verify failure**

```bash
bundle exec rspec spec/requests/event_participants_spec.rb
```

Expected: FAIL — routes undefined.

- [ ] **Step 3: Generate all 5 migrations**

```bash
rails generate migration CreateEventParticipants event_id:references user_id:references
rails generate migration CreateExpenses event_id:references payer_id:integer amount:decimal description:string
rails generate migration CreateIngredients event_id:references name:string quantity:string assignee_id:integer checked:boolean
rails generate migration CreatePhotos event_id:references uploader_id:integer image_url:string comment:text
rails generate migration CreateRatings event_id:references user_id:references taste:integer fun:integer value:integer repeat:integer
```

Edit each migration:

```ruby
# db/migrate/TIMESTAMP_create_event_participants.rb
class CreateEventParticipants < ActiveRecord::Migration[7.1]
  def change
    create_table :event_participants do |t|
      t.references :event, null: false, foreign_key: true
      t.references :user,  null: false, foreign_key: true
      t.timestamps
    end
    add_index :event_participants, [:event_id, :user_id], unique: true
  end
end
```

```ruby
# db/migrate/TIMESTAMP_create_expenses.rb
class CreateExpenses < ActiveRecord::Migration[7.1]
  def change
    create_table :expenses do |t|
      t.references :event, null: false, foreign_key: true
      t.integer    :payer_id, null: false
      t.decimal    :amount,   precision: 10, scale: 2, null: false
      t.string     :description
      t.timestamps
    end
    add_foreign_key :expenses, :users, column: :payer_id
  end
end
```

```ruby
# db/migrate/TIMESTAMP_create_ingredients.rb
class CreateIngredients < ActiveRecord::Migration[7.1]
  def change
    create_table :ingredients do |t|
      t.references :event, null: false, foreign_key: true
      t.string  :name,     null: false
      t.string  :quantity
      t.integer :assignee_id
      t.boolean :checked, default: false, null: false
      t.timestamps
    end
    add_foreign_key :ingredients, :users, column: :assignee_id
  end
end
```

```ruby
# db/migrate/TIMESTAMP_create_photos.rb
class CreatePhotos < ActiveRecord::Migration[7.1]
  def change
    create_table :photos do |t|
      t.references :event, null: false, foreign_key: true
      t.integer :uploader_id, null: false
      t.string  :image_url,   null: false
      t.text    :comment
      t.timestamps
    end
    add_foreign_key :photos, :users, column: :uploader_id
  end
end
```

```ruby
# db/migrate/TIMESTAMP_create_ratings.rb
class CreateRatings < ActiveRecord::Migration[7.1]
  def change
    create_table :ratings do |t|
      t.references :event, null: false, foreign_key: true
      t.references :user,  null: false, foreign_key: true
      t.integer :taste,  null: false
      t.integer :fun,    null: false
      t.integer :value,  null: false
      t.integer :repeat, null: false
      t.timestamps
    end
    add_index :ratings, [:event_id, :user_id], unique: true
  end
end
```

```bash
rails db:migrate
```

- [ ] **Step 4: Create all 5 models**

```ruby
# app/models/event_participant.rb
class EventParticipant < ApplicationRecord
  belongs_to :event
  belongs_to :user
  validates :user_id, uniqueness: { scope: :event_id }
end
```

```ruby
# app/models/expense.rb
class Expense < ApplicationRecord
  belongs_to :event
  belongs_to :payer, class_name: "User", foreign_key: :payer_id
  validates :amount, presence: true, numericality: { greater_than: 0 }
end
```

```ruby
# app/models/ingredient.rb
class Ingredient < ApplicationRecord
  belongs_to :event
  belongs_to :assignee, class_name: "User", foreign_key: :assignee_id, optional: true
  validates :name, presence: true
end
```

```ruby
# app/models/photo.rb
class Photo < ApplicationRecord
  belongs_to :event
  belongs_to :uploader, class_name: "User", foreign_key: :uploader_id
  validates :image_url, presence: true
end
```

```ruby
# app/models/rating.rb
class Rating < ApplicationRecord
  belongs_to :event
  belongs_to :user
  validates :taste, :fun, :value, :repeat,
            presence: true, inclusion: { in: 1..5 }
  validates :user_id, uniqueness: { scope: :event_id }
end
```

- [ ] **Step 5: Create all 5 controllers**

```ruby
# app/controllers/event_participants_controller.rb
class EventParticipantsController < ApplicationController
  before_action :set_event

  def index
    render json: { participants: @event.participants.map { |u|
      { id: u.id, name: u.name, avatar_url: u.avatar_url }
    } }
  end

  def create
    ep = EventParticipant.new(event: @event, user_id: params[:user_id])
    if ep.save
      render json: { message: "Participant added" }, status: :created
    else
      render json: { errors: ep.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    EventParticipant.find_by!(event: @event, user_id: params[:id]).destroy
    head :no_content
  end

  private

  def set_event = @event = Event.find(params[:event_id])
end
```

```ruby
# app/controllers/expenses_controller.rb
class ExpensesController < ApplicationController
  before_action :set_event
  before_action :set_expense, only: [:update, :destroy]

  def index
    render json: { expenses: @event.expenses.map { |e| expense_json(e) } }
  end

  def create
    expense = @event.expenses.new(expense_params.merge(payer: current_user))
    if expense.save
      render json: { expense: expense_json(expense) }, status: :created
    else
      render json: { errors: expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @expense.update(expense_params)
      render json: { expense: expense_json(@expense) }
    else
      render json: { errors: @expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @expense.destroy
    head :no_content
  end

  private

  def set_event   = @event   = Event.find(params[:event_id])
  def set_expense = @expense = @event.expenses.find(params[:id])
  def expense_params = params.require(:expense).permit(:amount, :description, :payer_id)

  def expense_json(e)
    { id: e.id, amount: e.amount, description: e.description,
      payer: { id: e.payer.id, name: e.payer.name } }
  end
end
```

```ruby
# app/controllers/ingredients_controller.rb
class IngredientsController < ApplicationController
  before_action :set_event
  before_action :set_ingredient, only: [:update, :destroy]

  def index
    render json: { ingredients: @event.ingredients.map { |i| ingredient_json(i) } }
  end

  def create
    ingredient = @event.ingredients.new(ingredient_params)
    if ingredient.save
      render json: { ingredient: ingredient_json(ingredient) }, status: :created
    else
      render json: { errors: ingredient.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @ingredient.update(ingredient_params)
      render json: { ingredient: ingredient_json(@ingredient) }
    else
      render json: { errors: @ingredient.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @ingredient.destroy
    head :no_content
  end

  private

  def set_event      = @event      = Event.find(params[:event_id])
  def set_ingredient = @ingredient = @event.ingredients.find(params[:id])
  def ingredient_params = params.require(:ingredient).permit(:name, :quantity, :assignee_id, :checked)

  def ingredient_json(i)
    { id: i.id, name: i.name, quantity: i.quantity, checked: i.checked,
      assignee: i.assignee ? { id: i.assignee.id, name: i.assignee.name } : nil }
  end
end
```

```ruby
# app/controllers/photos_controller.rb
class PhotosController < ApplicationController
  before_action :set_event

  def index
    render json: { photos: @event.photos.map { |p| photo_json(p) } }
  end

  def create
    photo = @event.photos.new(photo_params.merge(uploader: current_user))
    if photo.save
      render json: { photo: photo_json(photo) }, status: :created
    else
      render json: { errors: photo.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_event = @event = Event.find(params[:event_id])
  def photo_params = params.require(:photo).permit(:image_url, :comment)

  def photo_json(p)
    { id: p.id, image_url: p.image_url, comment: p.comment,
      uploader: { id: p.uploader.id, name: p.uploader.name } }
  end
end
```

```ruby
# app/controllers/ratings_controller.rb
class RatingsController < ApplicationController
  before_action :set_event

  def index
    ratings = @event.ratings
    render json: {
      ratings: ratings.map { |r| rating_json(r) },
      averages: {
        taste:  ratings.average(:taste).to_f.round(1),
        fun:    ratings.average(:fun).to_f.round(1),
        value:  ratings.average(:value).to_f.round(1),
        repeat: ratings.average(:repeat).to_f.round(1)
      }
    }
  end

  def create
    rating = @event.ratings.new(rating_params.merge(user: current_user))
    if rating.save
      render json: { rating: rating_json(rating) }, status: :created
    else
      render json: { errors: rating.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_event = @event = Event.find(params[:event_id])
  def rating_params = params.require(:rating).permit(:taste, :fun, :value, :repeat)

  def rating_json(r)
    { id: r.id, taste: r.taste, fun: r.fun, value: r.value, repeat: r.repeat,
      user: { id: r.user.id, name: r.user.name } }
  end
end
```

Update routes:
```ruby
# config/routes.rb
Rails.application.routes.draw do
  post   "/auth/signup",  to: "auth#signup"
  post   "/auth/login",   to: "auth#login"
  delete "/auth/logout",  to: "auth#logout"

  resources :events do
    resources :participants, controller: "event_participants", only: [:index, :create, :destroy]
    resources :expenses,     only: [:index, :create, :update, :destroy]
    resources :ingredients,  only: [:index, :create, :update, :destroy]
    resources :photos,       only: [:index, :create]
    resources :ratings,      only: [:index, :create]
  end
end
```

- [ ] **Step 6: Run tests**

```bash
bundle exec rspec spec/requests/event_participants_spec.rb
bundle exec rspec
```

Expected: All pass.

- [ ] **Step 7: Commit**

```bash
git add db/migrate/ app/models/ app/controllers/ spec/ config/routes.rb
git commit -m "feat: add event sub-resource models and controllers"
```

---

### Task 7: Recipes + Users/Me + Discover Endpoints

**Files:**
- Create: `db/migrate/TIMESTAMP_create_recipes.rb`
- Create: `app/models/recipe.rb`
- Create: `app/controllers/recipes_controller.rb`
- Create: `app/controllers/users/me_controller.rb`
- Create: `app/controllers/discover/rankings_controller.rb`
- Create: `app/controllers/discover/challenges_controller.rb`
- Create: `app/controllers/discover/contest_controller.rb`

- [ ] **Step 1: Write failing specs**

```ruby
# spec/requests/recipes_spec.rb
require "rails_helper"

RSpec.describe "Recipes", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers(user) }

  before { create_list(:recipe, 3, event_type: :cooking) }

  it "returns all recipes" do
    get "/recipes", headers: headers
    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)["recipes"].length).to eq(3)
  end

  it "filters by event_type" do
    create(:recipe, event_type: :bbq)
    get "/recipes", params: { event_type: "cooking" }, headers: headers
    expect(JSON.parse(response.body)["recipes"].length).to eq(3)
  end
end
```

```ruby
# spec/requests/users_me_spec.rb
require "rails_helper"

RSpec.describe "Users::Me", type: :request do
  let(:user)    { create(:user) }
  let(:headers) { auth_headers(user) }

  describe "GET /users/me" do
    it "returns the current user with stats" do
      get "/users/me", headers: headers
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["user"]["email"]).to eq(user.email)
      expect(body["user"]["stats"]).to be_present
    end
  end

  describe "PATCH /users/me" do
    it "updates the user name" do
      patch "/users/me",
            params: { user: { name: "New Name" } },
            headers: headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["user"]["name"]).to eq("New Name")
    end
  end
end
```

- [ ] **Step 2: Run to verify failure**

```bash
bundle exec rspec spec/requests/recipes_spec.rb spec/requests/users_me_spec.rb
```

Expected: FAIL.

- [ ] **Step 3: Recipe migration + model + factory**

```bash
rails generate migration CreateRecipes name:string event_type:integer cook_time_minutes:integer serves:integer difficulty:integer image_url:string
```

```ruby
# db/migrate/TIMESTAMP_create_recipes.rb
class CreateRecipes < ActiveRecord::Migration[7.1]
  def change
    create_table :recipes do |t|
      t.string  :name,               null: false
      t.integer :event_type,         null: false, default: 0
      t.integer :cook_time_minutes
      t.integer :serves
      t.integer :difficulty,         default: 0
      t.string  :image_url
      t.timestamps
    end
  end
end
```

```bash
rails db:migrate
```

```ruby
# app/models/recipe.rb
class Recipe < ApplicationRecord
  enum :event_type, { drinking: 0, bbq: 1, cooking: 2, other: 3 }
  enum :difficulty,  { easy: 0, medium: 1, hard: 2 }

  validates :name,       presence: true
  validates :event_type, presence: true

  scope :by_event_type, ->(type) { type.present? ? where(event_type: type) : all }
end
```

```ruby
# spec/factories/recipes.rb
FactoryBot.define do
  factory :recipe do
    name               { Faker::Food.dish }
    event_type         { :cooking }
    cook_time_minutes  { rand(15..90) }
    serves             { rand(4..12) }
    difficulty         { :easy }
    image_url          { nil }
  end
end
```

- [ ] **Step 4: Implement all controllers**

```ruby
# app/controllers/recipes_controller.rb
class RecipesController < ApplicationController
  def index
    render json: { recipes: Recipe.by_event_type(params[:event_type]).map { |r| recipe_json(r) } }
  end

  def show
    render json: { recipe: recipe_json(Recipe.find(params[:id])) }
  end

  private

  def recipe_json(r)
    { id: r.id, name: r.name, event_type: r.event_type,
      cook_time_minutes: r.cook_time_minutes, serves: r.serves,
      difficulty: r.difficulty, image_url: r.image_url }
  end
end
```

```ruby
# app/controllers/users/me_controller.rb
module Users
  class MeController < ApplicationController
    def show
      render json: { user: user_json(current_user) }
    end

    def update
      if current_user.update(me_params)
        render json: { user: user_json(current_user) }
      else
        render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def me_params
      params.require(:user).permit(:name, :avatar_url)
    end

    def user_json(user)
      {
        id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url,
        stats: {
          events_participated: user.event_participants.count,
          events_organized:    user.organized_events.count,
          average_rating:      user.ratings.average(:taste).to_f.round(1)
        }
      }
    end
  end
end
```

```ruby
# app/controllers/discover/rankings_controller.rb
module Discover
  class RankingsController < ApplicationController
    def index
      rankings = User
        .joins(:ratings)
        .group("users.id")
        .order("AVG(ratings.taste) DESC")
        .limit(10)
        .select("users.*, AVG(ratings.taste) AS avg_rating, COUNT(ratings.id) AS rating_count")
      render json: {
        rankings: rankings.map.with_index(1) { |u, rank|
          { rank: rank, user: { id: u.id, name: u.name },
            avg_rating: u.avg_rating.to_f.round(1), rating_count: u.rating_count }
        }
      }
    end
  end
end
```

```ruby
# app/controllers/discover/challenges_controller.rb
module Discover
  class ChallengesController < ApplicationController
    CHALLENGES = [
      { id: 1, name: "3回連続イベント参加", description: "3回連続でイベントに参加しよう", target: 3,  badge: "皆勤バッジ" },
      { id: 2, name: "料理マスター",        description: "3種類の料理イベントを主催しよう", target: 3, badge: "料理人バッジ" },
      { id: 3, name: "フォトグラファー",    description: "写真を10枚投稿しよう",           target: 10, badge: "カメラマンバッジ" }
    ].freeze

    def index
      challenges = CHALLENGES.map do |c|
        progress = challenge_progress(c[:id])
        c.merge(progress: progress, completed: progress >= c[:target])
      end
      render json: { challenges: challenges }
    end

    private

    def challenge_progress(id)
      case id
      when 1 then current_user.event_participants.count
      when 2 then current_user.organized_events.distinct.pluck(:event_type).count
      when 3 then current_user.photos.count
      else 0
      end
    end
  end
end
```

```ruby
# app/controllers/discover/contest_controller.rb
module Discover
  class ContestController < ApplicationController
    def index
      photos = Photo.includes(:uploader).order(created_at: :desc).limit(10)
      render json: {
        contest: {
          title: "#{Date.today.strftime('%Y年%-m月')}のベスト料理写真コンテスト",
          photos: photos.map { |p|
            { id: p.id, image_url: p.image_url,
              uploader: { id: p.uploader.id, name: p.uploader.name } }
          }
        }
      }
    end
  end
end
```

Update routes (final):
```ruby
# config/routes.rb
Rails.application.routes.draw do
  post   "/auth/signup",  to: "auth#signup"
  post   "/auth/login",   to: "auth#login"
  delete "/auth/logout",  to: "auth#logout"

  resources :events do
    resources :participants, controller: "event_participants", only: [:index, :create, :destroy]
    resources :expenses,     only: [:index, :create, :update, :destroy]
    resources :ingredients,  only: [:index, :create, :update, :destroy]
    resources :photos,       only: [:index, :create]
    resources :ratings,      only: [:index, :create]
  end

  resources :recipes, only: [:index, :show]

  namespace :users do
    resource :me, only: [:show, :update]
  end

  namespace :discover do
    get "rankings",   to: "rankings#index"
    get "challenges", to: "challenges#index"
    get "contest",    to: "contest#index"
  end
end
```

- [ ] **Step 5: Run full test suite**

```bash
bundle exec rspec
```

Expected: All examples pass, 0 failures.

- [ ] **Step 6: Commit**

```bash
git add db/migrate/ app/models/recipe.rb app/controllers/ spec/ config/routes.rb
git commit -m "feat: add recipes, users/me, and discover endpoints"
```

---

### Task 8: OpenAPI Spec

**Files:**
- Create: `docs/openapi.yaml`

- [ ] **Step 1: Create the spec**

```bash
mkdir -p docs
```

```yaml
# docs/openapi.yaml
openapi: "3.0.3"
info:
  title: OTTER Event API
  version: "1.0.0"

servers:
  - url: http://localhost:3001
    description: Development

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        id:         { type: integer }
        name:       { type: string }
        email:      { type: string, format: email }
        avatar_url: { type: string, nullable: true }

    Event:
      type: object
      properties:
        id:                { type: integer }
        name:              { type: string }
        event_type:        { type: string, enum: [drinking, bbq, cooking, other] }
        date:              { type: string, format: date }
        time:              { type: string, example: "18:00" }
        location:          { type: string, nullable: true }
        organizer:         { $ref: '#/components/schemas/User' }
        participant_count: { type: integer }
        created_at:        { type: string, format: date-time }

    Expense:
      type: object
      properties:
        id:          { type: integer }
        amount:      { type: number }
        description: { type: string, nullable: true }
        payer:       { $ref: '#/components/schemas/User' }

    Ingredient:
      type: object
      properties:
        id:       { type: integer }
        name:     { type: string }
        quantity: { type: string, nullable: true }
        checked:  { type: boolean }
        assignee: { $ref: '#/components/schemas/User', nullable: true }

    Photo:
      type: object
      properties:
        id:        { type: integer }
        image_url: { type: string }
        comment:   { type: string, nullable: true }
        uploader:  { $ref: '#/components/schemas/User' }

    Rating:
      type: object
      properties:
        id:     { type: integer }
        taste:  { type: integer, minimum: 1, maximum: 5 }
        fun:    { type: integer, minimum: 1, maximum: 5 }
        value:  { type: integer, minimum: 1, maximum: 5 }
        repeat: { type: integer, minimum: 1, maximum: 5 }
        user:   { $ref: '#/components/schemas/User' }

    Recipe:
      type: object
      properties:
        id:                { type: integer }
        name:              { type: string }
        event_type:        { type: string, enum: [drinking, bbq, cooking, other] }
        cook_time_minutes: { type: integer, nullable: true }
        serves:            { type: integer, nullable: true }
        difficulty:        { type: string, enum: [easy, medium, hard] }
        image_url:         { type: string, nullable: true }

security:
  - bearerAuth: []

paths:
  /auth/signup:
    post:
      tags: [Auth]
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [user]
              properties:
                user:
                  type: object
                  required: [name, email, password]
                  properties:
                    name:     { type: string }
                    email:    { type: string, format: email }
                    password: { type: string, minLength: 8 }
      responses:
        '201': { description: User created }
        '422': { description: Validation failed }

  /auth/login:
    post:
      tags: [Auth]
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:    { type: string }
                password: { type: string }
      responses:
        '200': { description: Login successful }
        '401': { description: Invalid credentials }

  /auth/logout:
    delete:
      tags: [Auth]
      responses:
        '200': { description: Logged out }

  /events:
    get:
      tags: [Events]
      parameters:
        - in: query
          name: filter
          schema: { type: string, enum: [upcoming, past] }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  events: { type: array, items: { $ref: '#/components/schemas/Event' } }
    post:
      tags: [Events]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [event]
              properties:
                event:
                  type: object
                  required: [name, event_type, date]
                  properties:
                    name:       { type: string }
                    event_type: { type: string, enum: [drinking, bbq, cooking, other] }
                    date:       { type: string, format: date }
                    time:       { type: string }
                    location:   { type: string }
      responses:
        '201': { description: Event created }

  /events/{id}:
    parameters:
      - in: path
        name: id
        required: true
        schema: { type: integer }
    get:
      tags: [Events]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  event: { $ref: '#/components/schemas/Event' }
    patch:
      tags: [Events]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                event:
                  type: object
                  properties:
                    name:       { type: string }
                    event_type: { type: string }
                    date:       { type: string, format: date }
                    time:       { type: string }
                    location:   { type: string }
      responses:
        '200': { description: Updated }
    delete:
      tags: [Events]
      responses:
        '204': { description: Deleted }

  /events/{event_id}/participants:
    parameters:
      - in: path
        name: event_id
        required: true
        schema: { type: integer }
    get:
      tags: [Participants]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  participants: { type: array, items: { $ref: '#/components/schemas/User' } }
    post:
      tags: [Participants]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [user_id]
              properties:
                user_id: { type: integer }
      responses:
        '201': { description: Added }

  /events/{event_id}/expenses:
    parameters:
      - in: path
        name: event_id
        required: true
        schema: { type: integer }
    get:
      tags: [Expenses]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  expenses: { type: array, items: { $ref: '#/components/schemas/Expense' } }
    post:
      tags: [Expenses]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [expense]
              properties:
                expense:
                  type: object
                  required: [amount]
                  properties:
                    amount:      { type: number }
                    description: { type: string }
      responses:
        '201': { description: Created }

  /events/{event_id}/ingredients:
    parameters:
      - in: path
        name: event_id
        required: true
        schema: { type: integer }
    get:
      tags: [Ingredients]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  ingredients: { type: array, items: { $ref: '#/components/schemas/Ingredient' } }
    post:
      tags: [Ingredients]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [ingredient]
              properties:
                ingredient:
                  type: object
                  required: [name]
                  properties:
                    name:        { type: string }
                    quantity:    { type: string }
                    assignee_id: { type: integer }
      responses:
        '201': { description: Created }

  /events/{event_id}/photos:
    parameters:
      - in: path
        name: event_id
        required: true
        schema: { type: integer }
    get:
      tags: [Photos]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  photos: { type: array, items: { $ref: '#/components/schemas/Photo' } }
    post:
      tags: [Photos]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [photo]
              properties:
                photo:
                  type: object
                  required: [image_url]
                  properties:
                    image_url: { type: string }
                    comment:   { type: string }
      responses:
        '201': { description: Uploaded }

  /events/{event_id}/ratings:
    parameters:
      - in: path
        name: event_id
        required: true
        schema: { type: integer }
    get:
      tags: [Ratings]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  ratings:  { type: array, items: { $ref: '#/components/schemas/Rating' } }
                  averages:
                    type: object
                    properties:
                      taste:  { type: number }
                      fun:    { type: number }
                      value:  { type: number }
                      repeat: { type: number }
    post:
      tags: [Ratings]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [rating]
              properties:
                rating:
                  type: object
                  required: [taste, fun, value, repeat]
                  properties:
                    taste:  { type: integer, minimum: 1, maximum: 5 }
                    fun:    { type: integer, minimum: 1, maximum: 5 }
                    value:  { type: integer, minimum: 1, maximum: 5 }
                    repeat: { type: integer, minimum: 1, maximum: 5 }
      responses:
        '201': { description: Submitted }

  /recipes:
    get:
      tags: [Recipes]
      parameters:
        - in: query
          name: event_type
          schema: { type: string, enum: [drinking, bbq, cooking, other] }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  recipes: { type: array, items: { $ref: '#/components/schemas/Recipe' } }

  /recipes/{id}:
    parameters:
      - in: path
        name: id
        required: true
        schema: { type: integer }
    get:
      tags: [Recipes]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  recipe: { $ref: '#/components/schemas/Recipe' }

  /users/me:
    get:
      tags: [Users]
      responses:
        '200': { description: Current user with stats }
    patch:
      tags: [Users]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                user:
                  type: object
                  properties:
                    name:       { type: string }
                    avatar_url: { type: string }
      responses:
        '200': { description: Updated }

  /discover/rankings:
    get:
      tags: [Discover]
      responses:
        '200': { description: Chef rankings }

  /discover/challenges:
    get:
      tags: [Discover]
      responses:
        '200': { description: User challenges }

  /discover/contest:
    get:
      tags: [Discover]
      responses:
        '200': { description: Photo contest }
```

- [ ] **Step 2: Commit**

```bash
git add docs/openapi.yaml
git commit -m "docs: add OpenAPI 3.0 specification"
```

---

### Task 9: Final Verification

- [ ] **Step 1: Run full test suite**

```bash
bundle exec rspec --format documentation
```

Expected: All examples pass, 0 failures.

- [ ] **Step 2: Start server and smoke-test**

```bash
rails server -p 3001
```

In a second terminal:
```bash
curl -s -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"user":{"name":"Taro","email":"taro@test.com","password":"password123"}}' | jq .
```

Expected: `{ "token": "...", "user": { "id": 1, "name": "Taro", ... } }`

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "chore: backend implementation complete, all tests passing"
```
