import math
import random as rand
import numpy as np

size = 400
sdf = [[size**2]*size for _ in range(size)]

def printsdf(sdf):
    for row in sdf:
        for el in row:
            print(str("%.2f" % el).center(5)), 
        print('\n'),
        print('\n'),

class Circle():
    def __init__(self, c):
        self.circle = c
    def dist(self,x,y):
        xdist = x-self.circle[0]
        ydist = y-self.circle[1]
        return math.sqrt(xdist*xdist+ydist*ydist)-self.circle[2]
    def draw(self,cr):
        circle = self.circle
        cr.arc(circle[0],circle[1],circle[2],0,2*math.pi)

class Rect():
    def __init__(self, rect):
        self.rect = rect
    def dist(self,x,y):
        xdist = abs(x-self.rect[0])-self.rect[2]
        ydist = abs(y-self.rect[1])-self.rect[3]
        if xdist<0 and ydist<0:
            dist = max(xdist,ydist)
        else:
            xdist = max(xdist,0)
            ydist = max(ydist,0)
            dist = math.sqrt(xdist*xdist+ydist*ydist)
        return dist
    def draw(self,cr):
        rect = self.rect
        cr.rectangle(rect[0]-rect[2],rect[1]-rect[3],rect[2]*2,rect[3]*2)

def fillobject(sdf,obj):
    for x in range(size):
        for y in range(size):
            dist = obj.dist(x,y)
            if sdf[x][y]<0:
                if dist<0:
                    sdf[x][y] = max(dist,sdf[x][y])
                if dist>0:
                    sdf[x][y] = max(-dist,sdf[x][y])
            else:
                if dist<0:
                    sdf[x][y] = max(dist,-sdf[x][y])
                else:
                    sdf[x][y] = min(dist,sdf[x][y])

def fillobjects(sdf,objs):
    for obj in objs:
        fillobject(sdf,obj)

objs = []
for _ in range(3):
    data = np.concatenate((np.random.rand(2)*size,np.random.rand(2)*20+20))
    objs.append(Rect(data))
for _ in range(3):
    data = np.concatenate((np.random.rand(2)*size,np.random.rand(1)*20+20))
    objs.append(Circle(data))
fillobjects(sdf,objs)

def raymarchstep(pos,direction):
    res = []
    while _:
        if not isinside(pos): break
        if sdf[int(pos[0])][int(pos[1])]<0: break
        res.append(pos)
        pos = pos + direction
    return res

def isinside(pos):
    if pos[0]<0 or pos[1]<0 or pos[0]>=size or pos[1]>=size:
        return False
    return True

def raymarch(pos,direction):
    res = []
    while _:
        if not isinside(pos):
            res.append(pos)
            return res
        dist = sdf[int(pos[0])][int(pos[1])]
        res.append(pos)
        pos = pos + direction*dist
        if dist<0.5: return res

def norm(vec):
    return vec/np.linalg.norm(vec)

def normal(pos):
    locpos = [int(pos[0]),int(pos[1])]
    if locpos[0]<=0 or locpos[0]>=size-1 or locpos[1]<=0 or locpos[1]>=size-1:
        normal = np.array([1,0])
    else:
        dx = (sdf[locpos[0]+1][locpos[1]]-sdf[locpos[0]-1][locpos[1]])/2
        dy = (sdf[locpos[0]][locpos[1]+1]-sdf[locpos[0]][locpos[1]-1])/2
        normal = norm(np.array([dx,dy]))
    return normal

def reflect(pos,direction):
    n = normal(pos)
    r = direction - 2*(np.dot(direction,n))*n
    return r


import framework
import cairo
import gtk

class SDFRenderer(framework.Screen):

    def mousemove(self,w,event):
        loc = [event.x,event.y]
        print(sdf[int(loc[0])][int(loc[1])])
        print(normal(loc))
        pass

    def draw(self, cr, width, height):
        self.connect('motion-notify-event',self.mousemove)
        rgb = np.zeros((size,size,4))
        for x in range(size):
            for y in range(size):
                dist = 4.0*sdf[y][x]/size
                rgb[x,y,0] = dist if dist>=0 else 0
                rgb[x,y,1] = -dist if dist<0 else 0
        for x in range(size):
            for y in range(size):
                rgb[x,y,0] = max(0,min(1,rgb[x,y,0]))
                rgb[x,y,1] = max(0,min(1,rgb[x,y,1]))
                rgb[x,y,2] = max(0,min(1,rgb[x,y,2]))

        arr = rgb*255
        arr = arr.astype(np.uint8)
        surface = cairo.ImageSurface.create_for_data(arr, cairo.FORMAT_RGB24, size, size)
        cr.set_source_surface(surface)
        cr.paint()
        cr.set_source_rgb(1,1,1)
        for obj in objs:
            obj.draw(cr)
            cr.stroke()
        for _ in range(100):
            isfirst = 0
            pos = np.random.rand(2)*size
            pos = [size/2,size/2]
            direction = norm(np.random.rand(2)-0.5)
            marchpos = raymarch(pos,direction)
            last = None
            for pos in marchpos:
                if isfirst>0:
                    col = float(isfirst)/len(marchpos)
                    if isfirst%2==1:
                        col = 1-col
                    cr.set_source_rgb(col,1-col,0)
                    cr.move_to(last[0],last[1])
                    cr.line_to(pos[0],pos[1])
                    cr.stroke()
                isfirst += 1
                last = pos

class LightRenderer(framework.Screen):
    def draw(self, cr, width, height):
        rgb = np.zeros((size,size,4))
        arr = rgb*255
        arr = arr.astype(np.uint8)
        surface = cairo.ImageSurface.create_for_data(arr, cairo.FORMAT_RGB24, size, size)
        cr.set_source_surface(surface)
        cr.paint()
        cr.set_source_rgb(1,1,1)
        for obj in objs:
            obj.draw(cr)
            cr.stroke()
        cr.set_source_rgba(1,1,1,0.01)
        cr.set_line_width(1)
        for _ in range(40000):
            isfirst = 0
            pos = np.random.rand(2)*size
            pos = [size/2,size/2]
            angle = rand.random()*math.pi*2
            direction = np.array([math.cos(angle),math.sin(angle)])
            for bounces in range(10):
                marchpos = raymarch(pos,direction)
                cr.move_to(marchpos[0][0],marchpos[0][1])
                cr.line_to(marchpos[-1][0],marchpos[-1][1])
                cr.stroke()
                if isinside(marchpos[-1]):
                    direction = reflect(marchpos[-1],direction)
                    pos = marchpos[-1]+direction
                else:
                    break


framework.run(SDFRenderer,size,size)
framework.run(LightRenderer,size,size)
#printsdf(sdf)
