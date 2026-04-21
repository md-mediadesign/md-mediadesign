jQuery(document).ready(function() {


    jQuery( "#contactForm" ).submit(function( event ) {
        userSubmitForm();
        event.preventDefault();
        return false;
    });


    function userSubmitForm(){

        var user_name = jQuery("#contactForm #name").val();
        var user_last_name = jQuery("#contactForm #last_name").val();
        var user_email = jQuery("#contactForm #email").val();
        var user_phone = jQuery("#contactForm #phone").val();
        var user_msg = jQuery("#contactForm #message").val();
        var user_service = jQuery("#contactForm #service").val();

        var data = {
            action: "submit_contact_form",
            nonce: "e4b9b92ea5",
            name: user_name,
            last_name: user_last_name,
            email: user_email,
            phone: user_phone,
            service: user_service,
            message: user_msg
        };
        jQuery.post("include/contact-form.php", data, userSubmitFormResponse, "text");

    }
    function userSubmitFormResponse(response) {
        var rez = JSON.parse(response);
        jQuery("#contactForm .trx_addons_message_box")
            .toggleClass("sc_infobox_style_error", false)
            .toggleClass("sc_infobox_style_success", false);
        if (rez.error == "") {
            jQuery("#contactForm .trx_addons_message_box").addClass("sc_infobox_style_success").html("Your message was sent!");
            setTimeout("jQuery('#contactForm .trx_addons_message_box').fadeOut(); jQuery('#contactForm').get(0).reset();", 3000);
        } else {
            jQuery("#contactForm .trx_addons_message_box").addClass("sc_infobox_style_error").html("Transmit failed! " + rez.error);
        }
        jQuery("#contactForm .trx_addons_message_box").fadeIn();
    }


});