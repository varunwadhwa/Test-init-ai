---
title: onboard_BMI_result
timestamp: 2017-02-02T14:37:24.653593941+05:30
---

< Please tell me your name.
* ask_for_info/patient/name

I'm [Varun](patient_name#first_name).
* provide_info/patient_name

< Hi [Varun](patient_name#first_name) ,congratulations on taking the first step towards a healthier future.
* iterate_name/wish/congratulatory_msg

< I will help you get there but I need some information from you first.
* message/assist_msg/get_data_msg

< Please tell me your height.
* ask_for_info/patient_details/vital/height

[5.5](vital#vital_value)
* provide_info/vital/height

< How much do you weigh?
* ask_for_info/patient_details/vital/weight

[65](vital#vital_value) [kg](vital#vital_unit)
* provide_info/vital/weight

< [Varun](patient_name#first_name) ,your [BMI](vital#vital_category) is [27](vital#vital_value) which is higher than the normal [BMI](vital#vital_category). Ideally you should weigh around [65](vital#vital_ideal_value) [kg](vital#vital_unit).
* provide_info/patient_details/vital/bmi_result