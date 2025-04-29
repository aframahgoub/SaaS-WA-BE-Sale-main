export interface ListBody{
    header_text?:string, //max - 60 characters.
    body_text:string,    //max - 4096 characters.
    footer_text?:string, //max - 60 characters.
    button_text:string   //max - 20 characters.
}

export interface ListRows{
    id:string,           //max - 200 characters.
    title:string,        //max - 24 characters.
    description?:string  //max - 72 characters.
}

export interface SingleList{
    title:string    //max - 24 characters.
    rows:ListRows[] //max - 10 List
}

export interface MultipleList{
    singleList:SingleList[]
}

export interface TextMessageContent{
    header?:string,
    body:string,
    footer?:string
}

export interface CTA_URL{
    display_text:string,
    url:string
}

export interface Address{
    street?:string,
    city?:string,
    state?:string,
    zip?:string,
    country?:string,
    country_code?:string,
    type?:string
}

export interface Email{
    email:string,
    type:string
}

export interface Name{
    formatted_name:string,
    first_name?:string,
    last_name?:string,
    middle_name?:string,
    suffix?:string,
    prefix?:string
}

export interface Org{
    company:string,
    department:string,
    title:string
}

export interface Phone{
    phone:string,
    type?:string,
    wa_id?:string
}

export interface Urls{
    url:string,
    type:string
}

export interface Contact{
    address?:Address[],
    birthday?:string,
    emails?:Email[],
    name:Name,
    org?:Org,
    phones:Phone[],
    urls?:Urls
}

export interface mediaResponse{
    url:string,
    mime_type:string,
    sha256:string,
    file_size:number,
    id:string,
    messaging_product:string
}

export interface errorMediaResponse {
    error: string;
}

export interface DeleteMediaResponse {
    success: boolean;
}

export interface ErrorResponse {
    error: string;
}

export interface docInfo{
    caption?:string,
    filename?:string
}

export interface CloudinaryUploadResult {
    asset_id: string;
    public_id: string;
    version: number;
    version_id: string;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    tags: [];
    bytes: number;
    type: string;
    etag: string;
    placeholder: boolean;
    url: string;
    secure_url: string;
    folder: string;
    original_filename: string;
    api_key: string;
}