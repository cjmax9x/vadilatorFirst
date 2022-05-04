
function Validator(option){
    var formElement = document.querySelector(option.form)
    var selctorRules = {}
    

    // Hàm tìm đến thẻ con báo lỗi, mặc dù nhiều thẻ cha
    function getParentElement (element, selector){
        while(element.parentElement){
                if(element.parentElement.matches(selector)){
                        return element.parentElement
                    }
                    element = element.parentElement
                }
            }

            
    // Click Đăng ký, loại bỏ mặc định của html và gọi luôn hàm validate báo lỗi
    formElement.onsubmit = function(e){
        e.preventDefault()
        var isFormvalid = true;
                    
        option.rules.forEach(function(rule){
            var inputElement = formElement.querySelector(rule.selector)
            var isvalid = validate(inputElement, rule) // return ra true hoặc false
            if (isvalid){
                isFormvalid = false
            }
        });


        // Lấy dữ liệu vào Hàm onSubmit
        if(isFormvalid){
            if(typeof option.onSubmit === 'function'){
            var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
            var formvalues = Array.from(enableInputs).reduce(function(values, input){
                switch(input.type){
                    case 'radio': 
                    values[input.name] = formElement.querySelector('input[name="'+ input.name +'"]:checked').value
                    break;

                    case 'file': 
                    values[input.name] = input.files;
                    break;
                    
                    case 'checkbox': 
                        if(!input.matches(':checked')){
                            return values
                        } 
                        if(!Array.isArray(values[input.name])){
                            values[input.name] = []
                        }
                        values[input.name].push(input.value)
                        break;

                    default: 
                    values[input.name] = input.value;
                }   
                    return values;
            }, {});
            option.onSubmit(formvalues)
            } else {
                //Nếu xóa hàm option.onSubmit() thì sẽ submit mặc định html
                formElement.submit();
                }
        }
    }
    

    option.rules.forEach(function(rule){
        //-------- Nhiều rule. lấy rule đẩy vào mảng trống
        if(Array.isArray(selctorRules[rule.selector])){
            selctorRules[rule.selector].push(rule.test)
        } else {
            selctorRules[rule.selector] = [rule.test]
        }


        var inputElements = formElement.querySelectorAll(rule.selector)
        Array.from(inputElements).forEach(function(inputElement){
            //blur(kích chuột ra ngoài) là hàm validate
            if(inputElement.type !== 'file'){
                inputElement.onblur = function(){
                    validate(inputElement, rule)
                    }
            }
            
            //----------

            // Nếu thẻ input có attribute name là select. thì thêm sự kiện onchange, là validate luôn
            if(inputElement.type === 'select-one' || inputElement.type === 'checkbox'
            || inputElement.type === 'file'){
                inputElement.onchange = function(){
                    validate(inputElement, rule)
                }
            }
                // Nhập dữ liệu vào input, thay đổi trạng thái ngay lập tức
        inputElement.oninput = function(){
            var errorElement = getParentElement(inputElement, option.formGroup).querySelector(option.errorSelector)
            errorElement.textContent = ''
            inputElement.classList.remove('invalid-input')
            errorElement.classList.remove('invalid')
        }
        })
            
})
    // 
    function validate(inputElement, rule){
        // var errorMessage = rule.test(inputElement.value) //1 rule

         // Tìm đến thẻ span báo lỗi
        var errorElement = getParentElement(inputElement, option.formGroup).querySelector(option.errorSelector)

        // Nhiều rules
        var rules = selctorRules[rule.selector]
        ////Nhiều rule
        for(i=0; i<rules.length; ++i){
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break;
                default: 
                errorMessage = rules[i](inputElement.value)
            }
            if(errorMessage) break;
        }
        //-----------


        // Nếu hàm test() true thì báo lỗi
        if( errorMessage){
            errorElement.textContent = errorMessage
            errorElement.classList.add('invalid')
            inputElement.classList.add('invalid-input')
        } 
        else { //nếu hàm test() false thì ẩn lỗi
            errorElement.textContent = ''
            inputElement.classList.remove('invalid-input')
        }
        return errorMessage; // Đọc dòng stt 25
    }
}

Validator.isRequired = function(selector, message) {
    return {
            selector: selector,
            test: function(value){
                return value ? false : message 
            }}
}
Validator.isEmail = function(selector, message) {
    return {
            selector: selector,
            test: function(value){
                var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
                return regex.test(value)? false: message 
            }}
}
Validator.isMinLength = function(selector, min, message) {
    return {
            selector: selector,
            test: function(value){
                return value.length >= min ? false: message(min)
            }}
}
Validator.isConfirmed = function(selector, compare, message) {
    return {
            selector: selector,
            test: function(value){
                return value === compare() ? undefined: message 
            }}
}
