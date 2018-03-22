// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:9a40d2a3-7c51-4b65-bf4d-762e3411bfca',
});
const bucketName = 'artk-dist';
const downloadBaseDir = 'download';
const downloadArxBaseDir = 'artoolkitX';
const bucket = new AWS.S3({params: {Bucket: bucketName}});

const urlPrefix="https://s3-us-west-2.amazonaws.com/" + bucketName + '/';

const params = {
    Prefix: downloadBaseDir
};

const paramsArx = {
    Prefix: downloadArxBaseDir
};

const readMetaData = (fileName, listItem) => {
    // Read meta data
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${urlPrefix}meta/${fileName}.json`, true);
    xhr.send();

    xhr.onreadystatechange = (e) => {
        if(xhr.readyState == 4 && xhr.status == 200){
            const response = JSON.parse(xhr.responseText);
            console.log("Success: " + response.time);
            const t = moment.unix(response.time);
            t.utc();
            const formatted = t.format("YYYY-MM-DD HH:mm");
            const gitText = `${formatted} UTC | ${response.commitMessage} | ${response.sha.substring(0,7)}`;
            
            const gitDetails = document.createElement('span');
            gitDetails.setAttribute('id', 'gitDetails');
            gitDetails.setAttribute('class', 'col-md-7');
            gitDetails.setAttribute('data-toggle', 'tooltip' );
            gitDetails.setAttribute('title', gitText);
            gitDetails.appendChild(document.createTextNode(gitText));
            listItem.appendChild(gitDetails);
        }
        else if (xhr.readyState == 4 && xhr.status != 200) {
            const gitDetails = document.createElement('span');
            gitDetails.setAttribute('id', 'gitDetails');
            gitDetails.setAttribute('class', 'col-md-7');
            gitDetails.appendChild(document.createTextNode(`N/A: ${xhr.status}`));
            listItem.appendChild(gitDetails);
        }
    }
}

const createList = (fileName, data, list, fileWithPath, meta) => {
    const listItem = document.createElement("li");
    const linkContainer = document.createElement('span');
    linkContainer.setAttribute('class', 'col-md-5');
    const link = document.createElement("a");
    link.setAttribute('href', `${urlPrefix}fileWithPath`);
    link.appendChild(document.createTextNode(fileName));
    linkContainer.appendChild(link);
    listItem.appendChild(linkContainer);
    list.appendChild(listItem);
    if(meta) {
        readMetaData(fileName, listItem);
    }
}

const buildDownloadList = (list, objects, data, meta) => {
    objects.appendChild(list);
    for (let i = 0; i < data.Contents.length; i++) {
        let fileNameWithPath = data.Contents[i].Key;
        let fileName = fileNameWithPath.substr(fileNameWithPath.lastIndexOf('/')+1);
        if (fileName) {
            createList(fileName, fileNameWithPath, list, data, meta);
        }
    }
}

bucket.listObjectsV2(paramsArx, (err, data) => {
    const status = document.getElementById('statusArx');
    if (err) {
        status.innerHTML =
        'Could not load objects from S3 error: ' + err;
    } else {
        document.getElementById('spinnerArx').style.display='none';        
        status.innerHTML ='Loaded ' + data.Contents.length + ' items from S3';
        const objects = document.getElementById('objectsArx');
        const list = document.createElement('ul');
        buildDownloadList(list, objects, data);
    }
});

bucket.listObjectsV2(params, function (err, data) {
    if (err) {
        document.getElementById('status').innerHTML =
        'Could not load objects from S3 error: ' + err;
    } else {
        document.getElementById('spinner').style.display='none';        
        document.getElementById('status').innerHTML ='Loaded ' + data.Contents.length + ' items from S3';
        const objects = document.getElementById('objects');
        const list = document.createElement('ul');
        buildDownloadList(list, objects, data, true);
    }
}); 