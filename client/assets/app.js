// Initialize angular app
var app = angular.module('app', ['ngRoute', 'btford.socket-io']);


// Sockets:
var socket = io();
var scores = document.getElementById('scores')
console.log(scores)

