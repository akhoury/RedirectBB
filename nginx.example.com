# this is an http setup for nginx server using ubbredirector

upstream ubbredirector {
    server 127.0.0.1:3000;
}

server {
	listen   80;

	root /var/www/example.com;

	index index.php index.html index.htm;

	server_name example.com www.example.com;

	# this must precede the location /forums right below it
	# basically tells nginx to serve the forums/images as they are, static
	# you can get fancy here with the caching as this directory, after migration, will not never really get updated
	# unless of course, you use it for something else
	location /forums/images {
                # you can turn that off if you want
		autoindex on;
		
                alias /var/www/example.com/forums/images/;
        }

	# so all requests that goes www.example.com/forums
	# will be handled by ubbredirector
	# since I had UBB installed in /forums pre-migration
	location /forums {
		root /home/admin/code/ubb-redirector;
	      	proxy_set_header X-Real-IP $remote_addr;
      		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    		proxy_set_header Host $http_host;
      		proxy_set_header X-NginX-Proxy true;
     		proxy_pass http://ubbredirector/;
      		proxy_redirect off;
      	}

	location / {
		try_files $uri $uri/ /index.php?q=$uri&$args;
	}

	access_log /var/log/nginx/access.example.com.log;
	error_log /var/log/nginx/error.example.com.log crit;

	error_page 404 /404.html;

	error_page 500 502 503 504 /50x.html;
	location = /50x.html {
		root /var/www/example.com;
	}

	# I also had a wordpress running on this main site
	# pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
	location ~ \.php$ {
		try_files $uri =404;
		#fastcgi_pass 127.0.0.1:9000;
		# With php5-fpm:
		fastcgi_pass unix:/var/run/php5-fpm.sock;
		fastcgi_index index.php;
	        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
		include fastcgi_params;
	}
}
