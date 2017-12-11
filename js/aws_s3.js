// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:9a40d2a3-7c51-4b65-bf4d-762e3411bfca',
});
const bucketName = 'artk-dist';
const downloadBaseDir = 'download';
const bucket = new AWS.S3({params: {Bucket: bucketName}});

const urlPrefix="https://s3-us-west-2.amazonaws.com/" + bucketName + '/';

const params = {
    Prefix: 'download'
};

bucket.listObjectsV2(params, function (err, data) {
    if (err) {
        document.getElementById('status').innerHTML =
        'Could not load objects from S3 error: ' + err;
    } else {
        document.getElementById('spinner').style.display='none';        
        document.getElementById('status').innerHTML ='Loaded ' + data.Contents.length + ' items from S3';
        const objects = document.getElementById('objects');
        const list = document.createElement('ul');
        objects.appendChild(list);
        for (let i = 0; i < data.Contents.length; i++) {
            let fileNameWithPath = data.Contents[i].Key;
            let fileName = fileNameWithPath.substr(fileNameWithPath.lastIndexOf('/')+1);
            const element = document.createElement("li");
            const link = document.createElement("a");
            link.setAttribute('href', `${urlPrefix}${data.Contents[i].Key}`);
            link.appendChild(document.createTextNode(fileName));
            element.appendChild(link);
            list.appendChild(element);
            // Read meta data
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `${urlPrefix}meta/${fileName}.json`, true);
            xhr.send();

            xhr.onreadystatechange = (e) => {
                if(xhr.readyState == 4 && xhr.status == 200){
                    const response = JSON.parse(xhr.responseText);
                    console.log("Success: " + response.time);
                    // document.getElementById(`meta-${i}`).innerText = response.time;
                }
                else {
                    console.log(xhr.status);
                }
            };
        }
    }
}); 