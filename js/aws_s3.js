// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:9a40d2a3-7c51-4b65-bf4d-762e3411bfca',
});
const bucketName = 'artk-dist';
const downloadBaseDir = 'download';
const bucket = new AWS.S3({params: {Bucket: bucketName}});

const urlPrefix="https://s3-us-west-2.amazonaws.com/" + bucketName + '/';

bucket.listObjectsV2(function (err, data) {
    if (err) {
        document.getElementById('status').innerHTML =
        'Could not load objects from S3 error: ' + err;
    } else {
        document.getElementById('status').innerHTML ='Loaded ' + data.Contents.length + ' items from S3';

        for (var i = 0; i < data.Contents.length; i++) {
            let fileNameWithPath = data.Contents[i].Key;
            let fileName = fileNameWithPath.substr(fileNameWithPath.lastIndexOf('/')+1);
            document.getElementById('objects').innerHTML += `<li><a href=${urlPrefix}${data.Contents[i].Key}>${fileName}</a></li>`
        }
    }
}); 