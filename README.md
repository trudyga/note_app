# note_app
Note web application on node.js

<h2> Description </h2>
This is training project for nodejs and use next frameworks/libraries:
<ul>
  <li><i>express</i> for requests routing</li>
  <li><i>restify</i> for multiservice architecture</li>
  <li><i>passport</i> for authentication strategies</li>
  <li><i>sequelize</i> for dealing with sql-compatible databases (ORM)</li>
  <li><i>mocha, chai</i> for testing purposes</li>
  <li><i>connect</i> for multi-user interaction</li>
</ul>

<p> Implemented several model strategies for storing note instances: in-memory, in-file-system, in-mysql </p>
<p> Note storage models are covered by tests </p>
<p> Extensive usage of <i>docker</i> for production and testing deployment. 
Thus docker, docker-compose, docker-machine must be installed.</p>

<h2> Usage </h2>
To deploy project:
<ol>
  <li>cd compose/</li>
  <li>docker compose up --build</li>
  <li>enjoy</li>
</ol>

<h2> Restrictions <h2>
<ol>
  <li>only windows-1251 charset is supported for note's key, title or body as well as for username and password</li>
</ol>
