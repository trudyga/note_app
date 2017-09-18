'use strict';


const should = require('chai').should();
const expect = require('chai').expect;

console.log(`Model: ${process.env.MODEL_TO_TEST}`);
const model = require(process.env.MODEL_TO_TEST);

describe("Model Test", function () {
    let initalNoteAmount = 3;

   beforeEach(function () {
       return model.keylist().then(keyz => {
           let todel = keyz.map(key => model.destroy(key));
           return Promise.all(todel);
       }).then(() => {
           return Promise.all([
               model.create("n1", "Note 1", "Note 1"),
               model.create("n2", "Note 2", "Note 2"),
               model.create("n3", "Note 3", "Note 3")
           ]);
       }).then(notes => {
           initalNoteAmount = notes.length;
       });
   });

   describe("test keylist", function() {
      it("should have three entries", function () {
          return model.keylist().then(keyz => {
              keyz.should.have.lengthOf(3);
          });
      });

      it("should have keys n1 n2 n3", function () {
          return model.keylist().then(keyz => {
              keyz.should.have.members(['n1', 'n2', 'n3']);
          });
      });

      it("should have titles Node #", function () {
          return model.keylist().then(keyz => {
              let keyPromises = keyz.map(key => model.read(key));
              return Promise.all(keyPromises);
          }).then(notes => {
              notes.forEach(note => {
                  note.title.should.match(/Note [123]/);
              });
          });
      });
   });

   describe("test create", function () {
       beforeEach(function () {
           model.create("test", "test", "test");
       });

       afterEach(function () {
           model.destroy("test");
       });

       it("should add one note", function () {
           model.keylist((keyz) => {
               keyz.should.have.lengthOf(initalNoteAmount + 1);
           });
       });

       it("should have key test", function () {
           model.keylist((keyz) => {
               keyz.should.include("test");
           });
       });

       it("should have title", function () {
           model.keylist((keyz) => {
               keyz.forEach(key => model.read(key))
                   .then(notesPromises => Promise.all(notesPromises))
                   .then(notes => {
                       notes.map(note => note.title)
                           .should.include("test");
                   });
           });
       });

       it("should have body", function () {
           model.keylist((keyz) => {
               keyz.forEach(key => model.read(key))
                   .then(notesPromises => Promise.all(notesPromises))
                   .then(notes => {
                       notes.map(note => note.body)
                           .should.include("test");
                   });
           });
       });

       // describe("should fail creation", function () {
       //     it("wrong key name", function (done) {
       //         model.create("ве№42", "test", "test").then(note => {
       //             done(new Error("Should fail"));
       //         }).catch(err => {
       //             done();
       //         });
       //     });
       //
       //     it("wrong title name", function (done) {
       //         model.create("test", "лоыва232*(№", "test").then(note => {
       //             done(new Error("Should fail"));
       //         }).catch(err => done());
       //     });
       // });
   });

   describe("should destroy", function () {
       it("should remove one note", function () {
           model.destroy("n1").then(() => {
               model.keylist().then(keyz => {
                   keyz.should.have.lengthOf(initalNoteAmount - 1);
               });
           });
       });

       it("should remove note with key n2", function () {
           model.destroy('n2').then(() => {
               model.keylist().then(keyz => {
                   keyz.should.not.include("n2");
               });
           });
       });
   });

   describe("should read", function () {
       it("should read note", function (done) {
          model.read('n1').then(note => {
              done();
          }).catch(err => {
              done(new Error('Note was not found'));
          });
       });

       it('should throw error if note does not exist', function (done) {
           model.read("note-does'nt exist").then(note => {
               done(new Error(`Note with key ${note.key} was found`));
           }).catch(err => {
               done();
           });
       });

       it('should have same key', function () {
           model.read('n1').then(note => {
               note.key.should.be.equal('n1');
           });
       });
   });

   describe("should update", function () {
       it("should throw error if note wasn't found", function (done) {
           model.update("note-doens't-exist", "title", "body").then(note => {
               done(new Error(`Note ${note.key} was updated`));
           }).catch(err => {
               done();
           });
       });

       it("should update title", function () {
           model.update('n1', 'title', 'n1').then(note => {
               note.title.should.be.equal('title');
           });
       });

       it("should update body", function () {
           model.update('n1', 'n1', 'body').then(note => {
               note.body.should.be.equal('body');
           });
       });
   });
});