<?php 
//////////////////////////
//Specify default values//
//////////////////////////

//Your E-mail

$your_email = 'test@gmail.com';

//Default Subject if 'subject' field does not exist
$default_subject = 'From My Contact Form';

//Message if e-mail not sent (server not configured)
$server_not_configured = 'Sorry, mail server not configured';


///////////////////////////
//Contact Form Processing//
///////////////////////////
$errors = array('error'=>'');
if(isset($_POST['message']) and isset($_POST['name'])) {
	if(!empty($_POST['name']))
		$sender_name  = stripslashes(strip_tags(trim($_POST['name'])));
	
	if(!empty($_POST['last_name']))
		$sender_last_name = stripslashes(strip_tags(trim($_POST['last_name'])));

	if(!empty($_POST['phone']))
		$sender_phone = stripslashes(strip_tags(trim($_POST['phone'])));

	if(!empty($_POST['message']))
		$message = stripslashes(strip_tags(trim($_POST['message'])));
	
	if(!empty($_POST['email']))
		$sender_email = stripslashes(strip_tags(trim($_POST['email'])));
	
	if(!empty($_POST['service']))
		$sender_service = stripslashes(strip_tags(trim($_POST['service'])));
	

	if(!empty($_POST['subject']))
		$subject = stripslashes(strip_tags(trim($_POST['subject'])));

	$from = (!empty($sender_email)) ? 'From: '.$sender_email : '';

	$subject = (!empty($subject)) ? $subject : $default_subject;

	$message = "
	Name: $sender_name 

	Last-name: $sender_last_name

	Phone: $sender_phone

	E-mail: $sender_email 

	Message: $message

	Service: $sender_service

	";

	//sending message if no errors
	if(empty($errors)) {
		if (mail($your_email, $subject, $message, $from)) {

		} else {
			$errors['error'] = $server_not_configured;
		}
	}
} else {
	// if "name" or "message" vars not send ('name' attribute of contact form input fields was changed)
	$errors['error'] = 'Error send message!';
}


echo json_encode($errors);
die();